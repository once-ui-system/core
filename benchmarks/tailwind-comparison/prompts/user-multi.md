Build the app described below in an existing Next.js 16 project (App Router, React 19, strict TypeScript).

Stack: {{STACK}}

Task: {{TASK}}

Requirements:
- Write as many files as the app needs, under `app/`, `components/` or `lib/`. It must serve these routes: {{ROUTES}}. Each route default-exports its page from its `page.tsx`; nested layouts (`app/**/layout.tsx`) are allowed.
- Do not change any file that already exists in the project except `app/page.tsx`. The root layout, global styles and the stack's standard providers already exist. You can read the project's existing files under `project/`.
- Put "use client" at the top of every file that uses state, effects or event handlers.
- Use realistic placeholder content defined in the files (no lorem ipsum). Load nothing from the network: no external image, font or API URLs.
- The app must type-check under strict TypeScript, pass `next build`, and render every route without console errors.
- Make it responsive from phone to desktop, and accessible.
- Reply with every file, each in its own fenced code block whose opening line names the file's path, like ```tsx app/settings/page.tsx, and nothing else.
