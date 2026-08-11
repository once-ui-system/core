---
name: once-ui-tailwind-port
description: >-
  Step-by-step guide and workflow for porting Once UI components to the Tailwind CSS
  generator architecture (generateClasses/cn). Covers consolidating Server/Client/Smart
  wrappers, eliminating runtime JS breakpoint listeners, and ensuring RSC compatibility.
---

# Once UI Tailwind Component Porting Guide

This skill guides you through refactoring and porting Once UI components to the Tailwind CSS class generator architecture (`generateClasses` and `cn`).

---

## 1. Core Architecture & Philosophy

1. **Static CSS Classes over Runtime JS**:
   - **Legacy**: Breakpoint props (`xl`, `l`, `m`, `s`, `xs`) were evaluated at runtime in `Client*` components using `useLayout()` / `window.matchMedia` and injected into `element.style`.
   - **Tailwind Port**: All responsive breakpoints compile directly into static Tailwind CSS classes (`xl:*`, `l:*`, `m:*`, `s:*`, `xs:*`). They are resolved by the browser's CSS engine natively with 0ms runtime overhead, no layout shift, and 100% React Server Component (RSC) compatibility.

2. **Consolidation of 3-File Component Splits**:
   - **Legacy**: Three separate files per component (`ServerFlex.tsx`, `ClientFlex.tsx`, `Flex.tsx`).
   - **Tailwind Port**: A single unified component in `[Component].tsx` (e.g., `Flex.tsx`, `Grid.tsx`), with `Server*` and `Client*` re-exported for 100% backward compatibility.

3. **`generateClasses` & `cn`**:
   - `packages/core/src/classes/generator.ts` maps all design tokens, spacing, sizes, colors, borders, typography, effects, and responsive breakpoints.
   - `packages/core/src/classes/utils.ts` provides `cn` (`clsx` + `tailwind-merge`) to safely merge classes and eliminate collisions.

---

## 2. Porting Checklist & Step-by-Step Workflow

### Step 1: Analyze the Component
- Locate the existing component files (`[Component].tsx`, `Server[Component].tsx`, `Client[Component].tsx`).
- Identify:
  - Base element / tag (`div`, `section`, etc. via `as: Component = "div"`).
  - Component-specific styling props (direction, columns, rows, spacing, colors, etc.).
  - Whether custom ReactNode cursors are supported (`typeof cursor === "object"`).

### Step 2: Implement the Unified Component in `src/components/[Component].tsx`
1. Use `generateClasses({ ...props, className })`.
2. Remove runtime breakpoint cascading (`cascadedL`, `cascadedM`, etc.) — Tailwind media queries handle this naturally.
3. Remove inline `parsePosition`, `translateXValue`, `translateYValue`, or manual string dimensions — `generateClasses` handles them.
4. If the component supports a custom cursor object:
   ```tsx
   const hasCustomCursor = typeof cursor === "object" && cursor !== null;
   const combinedStyle: CSSProperties | undefined =
     hasCustomCursor || style
       ? {
           ...(hasCustomCursor ? { cursor: "none" } : {}),
           ...style,
         }
       : undefined;
   ```
5. Re-export backward compatibility aliases at the bottom of the file:
   ```tsx
   export const Server[Component] = [Component];
   export const Client[Component] = [Component];
   export type Server[Component]Props = [Component]ComponentProps;
   export type Client[Component]Props = [Component]ComponentProps;
   ```

### Step 3: Update `Server[Component].tsx` and `Client[Component].tsx`
Replace the legacy implementation in both files with a clean re-export:
```tsx
export {
  [Component],
  type [Component]ComponentProps,
  Server[Component],
  type Server[Component]Props,
  Client[Component],
  type Client[Component]Props,
} from "./[Component]";
```

### Step 4: Update `src/components/index.ts`
Export only the main component:
```tsx
export * from "./[Component]";
```

### Step 5: Wrapper Components (`Row`, `Column`, etc.)
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

## 3. Reference Implementation: `Flex.tsx`

```tsx
import { type CSSProperties, forwardRef } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import type {
  CommonProps,
  DisplayProps,
  FlexBreakpointProps,
  FlexProps,
  SizeProps,
  SpacingProps,
  StyleProps,
} from "../interfaces";
import { Cursor } from "./Cursor";

export interface FlexComponentProps
  extends FlexProps,
    SpacingProps,
    SizeProps,
    StyleProps,
    CommonProps,
    DisplayProps {
  className?: string;
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
  isDefaultBreakpoints?: boolean;
}

const Flex = forwardRef<HTMLDivElement, FlexComponentProps>(
  (
    {
      as: Component = "div",
      cursor,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    if (props.onBackground && props.onSolid) {
      console.warn(
        "You cannot use both 'onBackground' and 'onSolid' props simultaneously. Only one will be applied.",
      );
    }

    if (props.background && props.solid) {
      console.warn(
        "You cannot use both 'background' and 'solid' props simultaneously. Only one will be applied.",
      );
    }

    const hasCustomCursor = typeof cursor === "object" && cursor !== null;

    const classes = cn(
      generateClasses({
        ...props,
        cursor: typeof cursor === "string" ? cursor : undefined,
      }),
      className,
    );

    const combinedStyle: CSSProperties | undefined =
      hasCustomCursor || style
        ? {
            ...(hasCustomCursor ? { cursor: "none" } : {}),
            ...style,
          }
        : undefined;

    return (
      <Component ref={ref} className={classes} style={combinedStyle} {...props}>
        {children}
        {hasCustomCursor && <Cursor cursor={cursor} />}
      </Component>
    );
  },
);

Flex.displayName = "Flex";

export { Flex };
export const ServerFlex = Flex;
export const ClientFlex = Flex;
export type ServerFlexProps = FlexComponentProps;
export type ClientFlexProps = FlexComponentProps;
```

---

## 4. Verification & Testing Protocol

Always run the following commands after porting a component:

1. **Lint & Code Format**:
   ```bash
   pnpm --filter @once-ui-system/core exec biome check src/components/[Component].tsx
   pnpm --filter @once-ui-system/core exec biome format --write src/components/[Component].tsx
   ```

2. **TypeScript Typecheck**:
   ```bash
   pnpm --filter @once-ui-system/core typecheck
   ```

3. **Vitest Unit Tests**:
   ```bash
   pnpm --filter @once-ui-system/core test
   ```

4. **Monorepo Build**:
   ```bash
   pnpm build
   ```
