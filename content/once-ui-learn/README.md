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

## Pages (Phase 1)

1. Once UI Learn (home)
2. What is Once UI?
3. Install & config
4. Your first page
5. Semantics over CSS
6. Row, Column & Grid
7. Spacing & rhythm
8. Color & surfaces
9. Typography scale
10. Page skeleton
11. Column, not Flex
12. Harness overview
