# Once UI Learn — content source

Phase 1 lesson drafts for the [Once UI Learn](https://aveiro.app) Aveiro site (`learn-once-ui`).

## Structure

| Local folder | Aveiro path | Track |
|--------------|-------------|-------|
| `index.mdx` | `/index.mdx` | Homepage |
| `start/` | flat `/*.mdx` | Getting started |
| `foundations/` | flat `/*.mdx` | Core concepts |
| `patterns/` | flat `/*.mdx` | Reusable compositions |
| `tips/` | flat `/*.mdx` | Quick posts |
| `for-agents/` | flat `/*.mdx` | Agent harness |

> Aveiro API v1 requires sidebar folders to be created in the editor. Pages are uploaded as flat paths; organize into groups in Aveiro after publishing.

## Upload

```bash
DOPLER_API_TOKEN=av_live_... node content/once-ui-learn/upload.mjs
```

Uploads draft MDX to the Once UI Learn site. Review and publish in the Aveiro editor.

## Pages (Phase 1 + 2)

**Start & foundations** (12 pages) — orientation, layout, spacing, color, typography, tips, agents.

**Common patterns** (8 pages):

1. Static panel
2. Hero section
3. Form layout
4. Decoration layers
5. Highlighted card
6. Responsive stacking
7. Dialog & modal
8. Toast & feedback

**Design tips & agents** (2 pages):

1. Icons & buttons
2. Common gotchas (for agents)
