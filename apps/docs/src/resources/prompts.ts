/**
 * The prompt library on the home page.
 *
 * Every path a prompt names is a real artifact the docs host serves from
 * `/ai`, and the blocks each one lists come from the harness's own
 * task-to-block index — so a prompt cannot send an agent somewhere that does
 * not exist. When a task bundle or a block is added, update this file from
 * `ai/tasks/index.json` and `ai/examples/blocks/manifest.json` rather than
 * from memory.
 */

export interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

export interface PromptSection {
  id: string;
  title: string;
  description: string;
  prompts: Prompt[];
}

/** Every prompt opens with this, so an agent loads the rules before writing. */
const harness = `Use @once-ui-system/core for all UI. Read these first:

  docs.once-ui.com/ai/rules.compact.md   - the rules
  docs.once-ui.com/ai/catalog.json       - components by purpose`;

const free: Prompt[] = [
  {
    id: "setup",
    title: "Set your agent up",
    description:
      "Run once per project. Writes AGENTS.md and a Cursor rule so every later prompt starts from the rules instead of guessing.",
    prompt: `npm install @once-ui-system/core
npx once-ui-init-agent`,
  },
  {
    id: "marketing-hero",
    title: "Landing page",
    description:
      "Hero, proof and a call to action. Pulls the waitlist, header and footer blocks so the page has real structure rather than three stacked sections.",
    prompt: `${harness}
  docs.once-ui.com/ai/tasks/marketing-hero.json

Build a landing page for <what you are shipping>. Follow the task bundle,
and mimic the structure of the Waitlist1, Header1 and Footer4 blocks from
docs.once-ui.com/ai/examples/blocks/manifest.json - adapt the copy and data,
keep the composition.

Compose with Once UI primitives and token props. No raw div/span layout,
no Tailwind, no custom CSS.`,
  },
  {
    id: "pricing",
    title: "Pricing page",
    description:
      "Tiers, a comparison and the FAQ underneath. The bundle carries the layout decisions that make three columns survive a phone.",
    prompt: `${harness}
  docs.once-ui.com/ai/tasks/pricing.json

Build a pricing page with <your tiers>. Follow the task bundle, and take
the header and footer from the Header2 and Footer2 blocks in
docs.once-ui.com/ai/examples/blocks/manifest.json.

Compose with Once UI primitives and token props. No raw div/span layout,
no Tailwind, no custom CSS.`,
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description:
      "Sidebar, stat row and a data table. Dashboard1 and Table1 show how the charts and the table are meant to sit together.",
    prompt: `${harness}
  docs.once-ui.com/ai/tasks/dashboard.json

Build a dashboard showing <your metrics>. Follow the task bundle, and mimic
the Dashboard1, Table1, Sidebar1 and Header1 blocks from
docs.once-ui.com/ai/examples/blocks/manifest.json.

Charts come from @once-ui-system/core/data. Compose with Once UI primitives
and token props. No raw div/span layout, no Tailwind, no custom CSS.`,
  },
  {
    id: "chat",
    title: "Chat interface",
    description:
      "Thread list, message feed and composer. Chat1 and Feed3 handle the scroll and streaming behaviour that is tedious to get right by hand.",
    prompt: `${harness}
  docs.once-ui.com/ai/tasks/chat.json

Build a chat interface for <your assistant>. Follow the task bundle, and
mimic the Chat1, Feed3 and Sidebar4 blocks from
docs.once-ui.com/ai/examples/blocks/manifest.json.

Compose with Once UI primitives and token props. No raw div/span layout,
no Tailwind, no custom CSS.`,
  },
  {
    id: "auth",
    title: "Sign in and sign up",
    description:
      "Both screens, with validation and error states wired to the form controls rather than bolted on afterwards.",
    prompt: `${harness}
  docs.once-ui.com/ai/tasks/auth.json

Build sign-in and sign-up screens for <your app>. Follow the task bundle,
and take the header from the Header2 block in
docs.once-ui.com/ai/examples/blocks/manifest.json.

Use Input with its validate prop for field errors. Compose with Once UI
primitives and token props. No raw div/span layout, no Tailwind, no
custom CSS.`,
  },
  {
    id: "settings",
    title: "Settings",
    description:
      "Sectioned preferences with the controls people expect - switches, selects and a destructive action that asks first.",
    prompt: `${harness}
  docs.once-ui.com/ai/tasks/settings.json

Build a settings page covering <your sections>. Follow the task bundle, and
mimic the Header4 and Sidebar1 blocks from
docs.once-ui.com/ai/examples/blocks/manifest.json.

Compose with Once UI primitives and token props. No raw div/span layout,
no Tailwind, no custom CSS.`,
  },
  {
    id: "roadmap",
    title: "Roadmap",
    description:
      "Shipped, in progress and planned, with the status treatment already decided so the three states read differently at a glance.",
    prompt: `${harness}
  docs.once-ui.com/ai/tasks/roadmap.json

Build a public roadmap for <your product>. Follow the task bundle, and mimic
the Roadmap1 block from docs.once-ui.com/ai/examples/blocks/manifest.json.

Compose with Once UI primitives and token props. No raw div/span layout,
no Tailwind, no custom CSS.`,
  },
];

const pro: Prompt[] = [
  {
    id: "magic-store",
    title: "Storefront",
    description:
      "Magic Store on Fourthwall: catalogue, product pages, cart and checkout. Fourthwall handles payment, shipping and fulfilment, so the build is the storefront rather than the commerce backend.",
    prompt: `${harness}

Bootstrap a storefront from Magic Store
(once-ui.com/products/magic-store). Clone the template, then:

1. Point it at my Fourthwall shop - set the storefront token in .env
2. Replace the brand: logo, name, and the brand and accent schemes
3. Adapt the collections and product pages to <what you sell>
4. Keep the cart and checkout flow as shipped; Fourthwall owns payment,
   shipping and fulfilment

Compose any new UI with Once UI primitives and token props. No raw
div/span layout, no Tailwind, no custom CSS.`,
  },
];

export const promptSections: PromptSection[] = [
  {
    id: "free",
    title: "Start from a prompt",
    description:
      "Each one points your agent at the harness and the blocks that match the task. Fill in the angle brackets and paste.",
    prompts: free,
  },
  {
    id: "pro",
    title: "Bootstrap a whole app",
    description:
      "Pro templates ship the parts a prompt cannot invent - payments, auth, a schema - so the agent adapts a working app instead of starting from an empty page.",
    prompts: pro,
  },
];
