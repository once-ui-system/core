---
name: once-ui-tailwind-port
description: >-
  Step-by-step guide and workflow for porting Once UI components to the Tailwind CSS
  generator architecture (generateClasses/cn). Covers consolidating Server/Client/Smart
  wrappers, eliminating SCSS modules, handling RSC compatibility, and git commit protocol.
---

# Once UI Tailwind Component Porting Guide

This skill provides the authoritative guide and step-by-step workflow for refactoring and porting Once UI components to the Tailwind CSS class generator architecture (`generateClasses` and `cn`).

---

## 1. Core Architecture & Philosophy

1. **Static CSS Classes over Runtime JS**:
   - **Legacy**: Breakpoint props (`xl`, `l`, `m`, `s`, `xs`) were evaluated at runtime in `Client*` components using `useLayout()` / `window.matchMedia` and injected into `element.style`.
   - **Tailwind Port**: All responsive breakpoints compile directly into static Tailwind CSS classes (`xl:*`, `l:*`, `m:*`, `s:*`, `xs:*`). They are resolved by the browser's CSS engine natively with 0ms runtime overhead, no layout shift, and 100% React Server Component (RSC) compatibility.

2. **Consolidation of 3-File Component Splits**:
   - **Legacy**: Three separate files per component (`Server[Component].tsx`, `Client[Component].tsx`, `[Component].tsx`).
   - **Tailwind Port**: A single unified component in `[Component].tsx` (e.g., `Flex.tsx`, `Grid.tsx`), with `Server*` and `Client*` re-exported for 100% backward compatibility.

3. **`generateClasses` & `cn`**:
   - `packages/core/src/classes/generator.ts` maps all design tokens, spacing, sizes, colors, borders, typography, effects, and responsive breakpoints.
   - `packages/core/src/classes/utils.ts` provides `cn` (`clsx` + `tailwind-merge`) to safely merge classes and eliminate collisions.

---

## 2. SCSS Module Elimination & Tailwind Equivalents

Whenever porting a component with an adjacent `[Component].module.scss`, eliminate the SCSS file completely in favor of native Tailwind CSS utilities:

| Legacy SCSS Pattern | Tailwind CSS Utility |
|---|---|
| `.card:hover { background: var(--neutral-alpha-weak); }` | `hover:bg-neutral-alpha-weak` |
| `.fadeIn { animation: fadeIn 0.2s ease-in-out; }` | `animate-fadeIn` |
| `.columns-3`, `.l-columns-2` | `columns-3`, `l:columns-2` |
| `break-inside: avoid;` | `break-inside-avoid` |
| `scroll-snap-type: x mandatory;` | `snap-x snap-mandatory` |
| `scroll-snap-align: start;` | `snap-start` |
| `scrollbar-width: none;` (webkit hidden) | `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` |
| `user-select: none;` | `select-none` |
| `cursor: col-resize;` / `row-resize` | `cursor-col-resize` / `cursor-row-resize` |
| `display: flex; width: 100%;` | `flex w-full` |
| `transition: background 0.2s ease;` | `transition-colors duration-200` |

---

## 3. Client vs Server Directive Guidelines

- **Pure Server Components (No `"use client"` needed)**:
  Layout and presentation components (e.g., `Flex`, `Grid`, `Row`, `Column`, `MasonryGrid`) that only compute classes and render children without interactive state or browser hooks.
- **Client Components (Requires `"use client";` at top)**:
  Components that:
  1. Use React hooks (`useState`, `useEffect`, `useRef`, `useCallback`, etc. like `SplitView`, `CursorCard`, `ScrollContainer`).
  2. Accept or attach event handlers (`onClick`, `onMouseDown`, etc. like `Card`, `Button`, `IconButton`, `Input`). Next.js App Router requires `"use client"` on components accepting function props to serialize boundaries properly during SSR/SSG.

---

## 4. Standard Touch & Pointer Detection Pattern

When a component needs to detect touch vs pointer (mouse) environments (e.g. `Cursor`, `CursorCard`):

```tsx
useEffect(() => {
  const checkTouchDevice = () => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    return hasTouch && !hasPointer;
  };

  setIsTouchDevice(checkTouchDevice());

  const mediaQuery = window.matchMedia("(pointer: fine)");
  const handlePointerChange = () => setIsTouchDevice(checkTouchDevice());

  mediaQuery.addEventListener("change", handlePointerChange);

  return () => {
    mediaQuery.removeEventListener("change", handlePointerChange);
  };
}, []);
```

---

## 5. Porting Step-by-Step Workflow

### Step 1: Analyze the Component
- Locate the existing component files (`[Component].tsx`, `Server[Component].tsx`, `Client[Component].tsx`, `[Component].module.scss`).
- Identify:
  - Base element / tag (`div`, `section`, etc. via `as: Component = "div"` or `ElementType`).
  - Interactive callbacks (`onClick`, `href`, drag handlers).
  - Styling props, gaps, dimensions, responsive props.

### Step 2: Implement the Ported Component
1. Use `generateClasses({ ...props, className })` and wrap with `cn(..., className)`.
2. Remove runtime breakpoint cascading (`cascadedL`, `cascadedM`, etc.) — Tailwind media queries handle this naturally.
3. Remove inline `parsePosition`, `parseToken`, `translateXValue`, or manual string dimensions.
4. If the component has an obsolete `.module.scss` file, remove it (`rm src/components/[Component].module.scss`).
5. For consolidated 3-file components (`Flex`, `Grid`), re-export backward compatibility aliases (`Server*`, `Client*`).

### Step 3: Wrapper Components (`Row`, `Column`, etc.)
For convenience wrapper components that extend `Flex` or `Grid`:
- Extend `React.ComponentProps<typeof Flex>` (or `[Component]Props`).
- Forward `ref` and spread props cleanly:
```tsx
import { forwardRef } from "react";
import { Flex } from "./Flex";

export interface RowProps extends React.ComponentProps<typeof Flex> {
  children?: React.ReactNode;
}

export const Row = forwardRef<HTMLDivElement, RowProps>(({ children, ...rest }, ref) => {
  return (
    <Flex ref={ref} {...rest}>
      {children}
    </Flex>
  );
});

Row.displayName = "Row";
```

---

## 6. Verification, Testing & Git Commit Protocol

Always run the following steps in sequence:

1. **Lint & Code Format (Biome)**:
   ```bash
   pnpm --filter @once-ui-system/core exec biome check --write src/components/[Component].tsx
   ```

2. **TypeScript Typecheck**:
   ```bash
   pnpm --filter @once-ui-system/core typecheck
   ```

3. **Vitest Unit Tests**:
   Create or update unit tests in `packages/core/src/__tests__/[Component].test.tsx`.
   *(Note: If testing touch/pointer logic in jsdom, spy on `window.matchMedia` for `pointer: fine`)*:
   ```bash
   pnpm --filter @once-ui-system/core test
   ```

4. **Full Monorepo Build**:
   Verify core package, documentation app, and dev sandbox:
   ```bash
   pnpm build
   ```

5. **Proper Git Commit**:
   Stage the ported component, its tests, updated AI specs, deleted SCSS modules, and commit:
   ```bash
   git add packages/core/src/components/[Component].tsx packages/core/src/__tests__/[Component].test.tsx packages/core/ai
   git commit -m "refactor(core): port [Component] to Tailwind CSS and generator"
   ```
