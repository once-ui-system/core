# Once UI

A design system for indie builders who move fast and break limits without neglecting quality. Once UI combines the simplicity of low-code with the power of code: write 70% less compared to shadcn + tailwind.

* **Customization**: Manage design config with the ThemeProvider context.
* **Components**: Access advanced components with simple APIs.
* **Data-viz**: Add responsive charts with a few lines of code.
* **SEO**: Use SEO components to simplify meta and schema setup.

## Installation

```bash
npm install @once-ui-system/core
# or
yarn add @once-ui-system/core
# or
pnpm add @once-ui-system/core
```

## Documentation

Learn how to build with Once UI at [docs.once-ui.com](https://docs.once-ui.com/once-ui/quick-start).

## Setup

Import styles and tokens in your root layout file:

```js
// Import the pre-compiled CSS files
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
```

Create a `Providers.tsx` component:

```js
"use client";

import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DataThemeProvider>
        <ToastProvider>
          <IconProvider>
            {children}
          </IconProvider>
        </ToastProvider>
      </DataThemeProvider>
    </ThemeProvider>
  );
}
```

Wrap your app with the `Providers` component in your root layout:

```js
import { Providers } from "./providers";

export default function RootLayout({ children }: { 
  children: React.ReactNode 
}) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
```

Prevent flash of unstyled content (FOUC) by adding the following script to the `<head>` of your root layout:

```js
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          try {
            const root = document.documentElement;
            
            const defaultTheme = 'system';
            root.setAttribute('data-neutral', 'gray');
            root.setAttribute('data-brand', 'blue');
            root.setAttribute('data-accent', 'indigo');
            root.setAttribute('data-solid', 'contrast');
            root.setAttribute('data-solid-style', 'flat');
            root.setAttribute('data-border', 'playful');
            root.setAttribute('data-surface', 'filled');
            root.setAttribute('data-transition', 'all');
            root.setAttribute('data-scaling', '100');
            root.setAttribute('data-viz-style', 'categorical');
            
            const resolveTheme = (themeValue) => {
              if (!themeValue || themeValue === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              return themeValue;
            };
            
            const theme = localStorage.getItem('data-theme');
            const resolvedTheme = resolveTheme(theme);
            root.setAttribute('data-theme', resolvedTheme);
            
            const styleKeys = ['neutral', 'brand', 'accent', 'solid', 'solid-style', 'viz-style', 'border', 'surface', 'transition', 'scaling'];
            styleKeys.forEach(key => {
              const value = localStorage.getItem('data-' + key);
              if (value) {
                root.setAttribute('data-' + key, value);
              }
            });
          } catch (e) {
            document.documentElement.setAttribute('data-theme', 'dark');
          }
        })();
      `,
    }}
  />
</head>
```

## Quick start

[Magic Portfolio](https://once-ui.com/products/magic-portfolio): Our free portfolio starter used and loved by thousands of creatives. Simple, customizable, responsive.

[Magic Store](https://once-ui.com/products/magic-store) (PRO): Our premium ecommerce storefront that lets you launch your merch store in minutes. Payment, production and shipping managed by Fourthwall.

[Magic Docs](https://once-ui.com/products/magic-docs) (PRO): Our premium documentation generator. Just add your MDX files and let Magic Docs handle the rest.

[Magic Bio](https://once-ui.com/products/magic-bio) (PRO): Our premium link-in-bio template that automatically fetches open-graph data. Just add your links and deploy.

[Once UI Blocks](https://once-ui.com/blocks) (PRO): Copy-paste pre-designed blocks and deploy fully-functional sites with lightning speed.

[Once UI for Figma](https://once-ui.com/figma) (PRO): Design and prototype entire products from scratch in hours.

## Creators

Connect with us!

**Lorant One**: [Portfolio](https://lorant.one) / [Threads](https://www.threads.net/@lorant.one) / [LinkedIn](https://www.linkedin.com/in/lorant-one/)

**Zsofia Komaromi**: [Portfolio](https://zsofia.pro) / [Threads](https://www.threads.net/@zsofia_kom) / [LinkedIn](https://www.linkedin.com/in/zsofiakomaromi/)

## Become a Oncer

![Design Engineers Club](https://docs.once-ui.com/images/docs/vibe-coding-dark.jpg)

Join the [Design Engineers Club](https://discord.com/invite/5EyAQ4eNdS) on Discord to connect with us and share your projects.

Found a bug? Report it [here](https://github.com/once-ui-system/once-ui/issues/new?labels=bug&template=bug_report.md). Got a feature request? Submit it [here](https://github.com/once-ui-system/once-ui/issues/new?labels=feature%20request&template=feature_request.md).

## Sponsors

Once UI is an indie project. [Sponsor us](https://github.com/sponsors/once-ui-system) and get featured on our site!

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.