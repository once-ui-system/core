Build the app described below in an existing Next.js 16 project (App Router, React 19, strict TypeScript).

Stack: {{STACK}}

Task: {{TASK}}

Requirements:
- The app must serve these routes: {{ROUTES}}. Each route default-exports its page from its `page.tsx`; nested layouts are allowed.
- {{FILES_RULE}}
- Put "use client" at the top of every file that uses state, effects or event handlers.
- Use realistic placeholder content defined in the files (no lorem ipsum). Load nothing from the network: no external image, font or API URLs.
- The app must type-check under strict TypeScript, pass `next build`, and render every route without console errors.
- Make it responsive from phone to desktop, and accessible.
- Reply with every file, each in its own fenced code block whose opening line names the file's path, like ```tsx app/settings/page.tsx, and nothing else.
