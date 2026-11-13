# @once-ui-system/site-editor

One way to edit a website, for every product built on Once UI. The kit owns how
editing feels: where things sit, how selection, saving, undo and the preview
behave. The product owns what is saved, behind one adapter.

It is built from `@once-ui-system/core` parts only (Sortable, SegmentedControl,
Setting, Dropdown, Option, Dialog) and edits the page sections of
`@once-ui-system/blocks`, plus any sections a product adds.

```tsx
import { SiteEditor, createLocalAdapter } from "@once-ui-system/site-editor";
import { sectionSchemas } from "@once-ui-system/blocks";

const adapter = createLocalAdapter({ key: "my-site", previewPath: "/editor/preview" });

export default function EditorPage() {
  return <SiteEditor adapter={adapter} sections={Object.values(sectionSchemas)} />;
}
```

The preview page renders the site inside `PreviewRoot`:

```tsx
import { Sections } from "@once-ui-system/blocks";
import { PreviewRoot, PreviewSection } from "@once-ui-system/site-editor";

export default function Preview() {
  return (
    <PreviewRoot>
      {({ page }) =>
        page.sections.map((section) => (
          <PreviewSection key={section.id} id={section.id}>
            <Sections items={[section]} />
          </PreviewSection>
        ))
      }
    </PreviewRoot>
  );
}
```

## The interaction spec

This is the contract every editor built on the kit keeps. A product may add to
it (its own panels, field kinds and sections), never change it.

### Layout

```
┌──────┬──────────────────┬───────────────────────────────────────────┐
│ rail │ panel            │ toolbar: page · saved  │ device │ lang · Publish │
│      │                  ├───────────────────────────────────────────┤
│ ▣    │ Sections         │                                           │
│ ▤    │  Header (pinned) │            live preview (iframe)          │
│ ◐    │  Hero            │                                           │
│      │  Features        │                                           │
│      │  + Add section   │                                           │
│ ‹    │  Footer (pinned) │                                           │
└──────┴──────────────────┴───────────────────────────────────────────┘
```

- **Rail**, left: one icon per panel in a pill, the way out in its own pill at
  the foot. Every icon has a tooltip. The kit's panels are Sections, Pages and
  Design, in that order; a product appends its own after Design.
- **Panel**: 22rem wide by default, resizable from 18 to 32rem by its right
  edge, and the width is remembered per browser. Changing panels never moves
  the preview.
- **Canvas**: the live site in an iframe, always. The site renders in its own
  document so its styles, fonts and breakpoints are exactly what a visitor
  gets. Devices: desktop (fills the canvas), tablet (48rem) and mobile (24rem),
  over a quiet grid so a narrow device reads as a device.
- **Toolbar**, three parts sharing the width so the device switch sits at the
  canvas's centre: left, the page picker and the save state; middle, the device
  switch; right, the language picker (only with more than one language),
  undo and redo, and the primary action.

On phones the rail becomes a row of tabs over the panel, and the preview sits
under it at the device width of the phone.

### Selection

- One thing is selected at a time: a section, the header, the footer, or
  nothing.
- Clicking a section in the preview selects it, and so does clicking its tile
  in the list. Either way the preview outlines it and scrolls it into view, and
  the panel opens its fields.
- The panel's back arrow, `Esc`, or clicking the same tile again goes back to
  the list.
- Hovering a tile outlines that section faintly in the preview.
- Opening another page keeps the header or footer open (they are on every
  page) and clears any section.

### The section list

- The header is pinned at the top, the footer at the foot. They open like any
  section but cannot be moved or removed.
- Each tile shows the section's drawing, its name, and its own first words, so
  two Features sections are not the same tile.
- Drag a tile to reorder it, or focus it and use `Space` then the arrow keys.
- Between any two tiles a `+` appears on hover or focus; it opens the picker
  and inserts at that place. A dashed "Add section" tile at the end does the
  same for the bottom, for touch screens.
- The picker shows every section as its drawing, its name and one line on what
  it is for, in two columns. A product's own sections sit with the kit's.

### Fields

- A section's panel is drawn from its schema: text, textarea, image, link,
  choice, boolean and list. A product registers more kinds (a menu picker, a
  people picker) and they sit in the same column with the same spacing.
- A `layout` choice with drawings is shown as picture tiles; any other choice
  of up to four short values is a segmented control, longer ones a select.
- A field with `when` shows only while its condition holds; its value is kept
  for when the condition holds again.
- List rows fold to their title, open one at a time, and reorder like the
  section list. Add and remove sit at the row's foot, and the `max` from the
  schema is respected.
- The panel's header names the section and holds a "more" menu: duplicate,
  move up, move down, remove.

### Saving

- Everything saves by itself, 600 ms after the last change. There is no save
  button.
- The save state reads "Saved", "Saving…", "Unsaved" or "Couldn't save ·
  Retry". A failed save keeps the change and retries on the next edit or on
  Retry; leaving the page while unsaved asks first.
- If the adapter has `publish`, saves are drafts and the primary action is
  **Publish**, disabled while nothing has changed since the last publish.
  Without it, saves go live and the primary action is **Open site**.

### Undo

- Every change can be undone, including style changes, reorders and removes.
  Typing into one field is one step per pause, not one step per letter.
- Undo and redo are buttons in the toolbar and the shortcuts below. They work
  per page; opening another page starts its own history.

### Shortcuts

| Keys | Does |
| --- | --- |
| `⌘Z` / `Ctrl Z` | Undo |
| `⌘⇧Z` / `Ctrl Y` | Redo |
| `⌘D` | Duplicate the selected section |
| `⌘↑` / `⌘↓` | Move the selected section up or down |
| `⌫` | Remove the selected section (not while typing) |
| `Esc` | Back to the list |
| `?` | Show these shortcuts |

### Live preview

- Content changes reach the preview as you type: the editor posts the draft
  page to the frame, which renders it without a round trip. A preview that
  can only render on the server gets a `refresh` after each save instead.
- Design changes apply to the frame at once through `StyleScope`.
- A link inside the preview to another page of the site opens that page in the
  editor; other links do nothing there.
- Messages carry a `source` tag and are accepted from the same origin only.

### Agents

Every change is a named command (`add`, `remove`, `move`, `duplicate`,
`setProp`, `setProps`, `setStyle`). The panel, the shortcuts, an assistant and
an MCP tool all go through the same commands, so they undo, save and preview
the same way. `sectionSchemas` describe each section as plain JSON, which is
what a model reads to fill one.

## Adapter

```ts
interface SiteAdapter {
  listPages(): Promise<PageEntry[]>;
  loadPage(id: string): Promise<Page>;
  savePage(id: string, page: Page): Promise<void>;
  loadStyle(): Promise<SiteStyle>;
  saveStyle(style: SiteStyle): Promise<void>;
  createPage?(input: { title: string; slug: string }): Promise<PageEntry>;
  removePage?(id: string): Promise<void>;
  publish?(): Promise<void>;
  previewUrl(pageId: string, lang?: string): string;
  siteUrl?: string;
}
```

`createLocalAdapter` keeps a site in `localStorage`, so a demo or a template runs
with no backend. A product writes its own adapter over its tables or files.

## Licence

MIT.
