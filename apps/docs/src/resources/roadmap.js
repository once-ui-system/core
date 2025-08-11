const roadmap = [
  {
    product: "Once UI OSS",
    brand: "blue",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Smartlink preview",
            description: "Optional prop to preview OG data on hover.",
            type: "improvement"
          },
          {
            title: "Text highlights",
            description: "Add highlight effects (svg) to text.",
            type: "feature"
          },
          {
            title: "StylePanel refactoring",
            description: "Make stylepanel composable and add additional edit options like custom colors.",
            type: "feature"
          },
          {
            title: "Codeblock higlhight",
            description: "Fix highlight issue when switching between Codeblock tabs.",
            type: "bug"
          },
          {
            title: "OgCard",
            description: "Update OgCard docs with display prop. (Related: OgCard improvements)",
            type: "documentation"
          },
          {
            title: "Chart states",
            description: "Add state examples to chart docs. (Related: Chart error state)",
            type: "documentation"
          },
          {
            title: "Hooks & utils",
            description: "Add hooks and utils to docs.",
            type: "documentation"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
        ]
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Flex & Grid breakpoint objects",
            description: "Override props based on breakpoint.",
            type: "improvement"
          },
          {
            title: "Logo copy svg + visit brand page",
            description: "Add svg copy to logo and optional link to visit brand page.",
            type: "improvement"
          },
          {
            title: "ContextMenu",
            description: "New component: Context menu on right click.",
            type: "feature"
          },
          {
            title: "Accordion auto-collapse",
            description: "Optional prop to collapse other accordions when opening a new one.",
            type: "improvement"
          },
          {
            title: "Chart error state",
            description: "Add error state to chart components.",
            type: "improvement"
          },
          {
            title: "Media caption",
            description: "Add optional caption to the Media component.",
            type: "improvement"
          },
          {
            title: "OgCard improvements",
            description: "Add size prop and data overrides separately.",
            type: "improvement"
          },
          {
            title: "ProgressBar",
            description: "New component: Progress bar.",
            type: "feature"
          },
          {
            title: "Custom cursor",
            description: "Allow Flex and Grid to support custom cursor elements as ReactNode.",
            type: "feature"
          },
          {
            title: "List and ListItem",
            description: "New List and ListItem components.",
            type: "feature"
          },
          {
            title: "Select multiple options",
            description: "Add option for Select to handle multiple options.",
            type: "feature"
          },
          {
            title: "Number animations",
            description: "Create component to handle number animations.",
            type: "feature"
          },
          {
            title: "Carousel effects",
            description: "Rework timing functions in RevealFx and Carousel.",
            type: "improvement"
          },
          {
            title: "BlockQuote",
            description: "New component: Block quote and remove default styles from global.scss.",
            type: "feature"
          },
          {
            title: "Datepicker accessibility",
            description: "Add arrow navigation and use Options instead of Buttons.",
            type: "bug"
          },
        ]
      }
    ]
  },
  {
    product: "Once UI Pro",
    brand: "indigo",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Magic Connect",
            description: "New social media app product template.",
            type: "feature"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
        ]
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Blocks page",
            description: "Rework the page layout and UI.",
            type: "feature"
          },
          {
            title: "Comments",
            description: "Add comment system UI to Blocks.",
            type: "feature"
          },
          {
            title: "Improve block designs",
            description: "Rework block UI and improve aesthetics.",
            type: "improvement"
          },
          {
            title: "Magic Agent",
            description: "New chat agent product template.",
            type: "feature"
          },
        ]
      },
    ]
  },
  {
    product: "Magic Convert",
    brand: "green",
    columns: [
      {
        title: "Planned",
        tasks: [
        ]
      },
      {
        title: "In Progress",
        tasks: [
          {
            title: "Product page designs",
            description: "Create designs for product pages.",
            type: "feature"
          },
        ]
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Brand guidelines page",
            description: "Create brand guidelines page. (Related: Logo copy svg + visit brand page)",
            type: "feature"
          },
        ]
      }
    ]
  },
  {
    product: "Magic Docs",
    brand: "magenta",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Hot reload",
            description: "Automatically re-render documentation when changes are detected in MDX files.",
            type: "feature"
          },
          {
            title: "Versioning",
            description: "Add versioning to documentation.",
            type: "feature"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
        ]
      },
      {
        title: "Done",
        tasks: [
        ]
      }
    ]
  },
  {
    product: "Magic Portfolio",
    brand: "orange",
    columns: [
      {
        title: "Planned",
        tasks: [
        ]
      },
      {
        title: "In Progress",
        tasks: [
          {
            title: "Fix OG error",
            description: "Fix Open Graph resolution error.",
            type: "bug"
          },
        ]
      },
      {
        title: "Done",
        tasks: [
        ]
      }
    ]
  },
  {
    product: "Magic Bio",
    brand: "emerald",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Add OG data overrides",
            description: "Add OG data overrides to links. (Related: OgCard improvements)",
            type: "improvement"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
        ]
      },
      {
        title: "Done",
        tasks: [
        ]
      }
    ]
  },
  {
    product: "Once UI Hub",
    brand: "cyan",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "Notifications",
            description: "Notification center for project updates and comments.",
            type: "feature"
          },
          {
            title: "Post formats",
            description: "Support for different post formats.",
            type: "feature"
          },
          {
            title: "Achievements",
            description: "Add achievements to profile page.",
            type: "feature"
          },
          {
            title: "Testimonials",
            description: "Submit testimonials and display on Once UI landing pages.",
            type: "feature"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
        ]
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Drafts",
            description: "Add new draft status that hides posts from feed and search.",
            type: "feature"
          },
        ]
      }
    ]
  },
  {
    product: "Design Engineers Club",
    brand: "aqua",
    columns: [
      {
        title: "Planned",
        tasks: [
          {
            title: "New landing page",
            description: "Create a new home for our community.",
            type: "feature"
          },
        ]
      },
      {
        title: "In Progress",
        tasks: [
        ]
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Merch drop",
            description: "New mascot design for Once UI and merch line",
            type: "feature"
          },
        ]
      }
    ]
  }
];

const task = {
  bug: { label: "Bug", color: "red" },
  feature: { label: "Feature", color: "green" },
  improvement: { label: "Improvement", color: "blue" },
  documentation: { label: "Docs", color: "magenta" },
  performance: { label: "Performance", color: "orange" },
  security: { label: "Security", color: "indigo" }
};

export { roadmap, task };