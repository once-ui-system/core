import { SmartLink, InlineCode } from "@once-ui-system/core";

const changelog = [
  {
    date: "2026-02-03",
    title: "Once UI 1.6: Presence in structure",
    image: "/images/changelog/once-ui-1-6.jpg",
    sections: [
      {
        title: "New components",
        bullets: [
          <>ScrollLock: New utility component</>,
          <>ThemeInit: New utility component</>,
        ],
      },
      {
        title: "Component improvements",
        bullets: [
          <><SmartLink unstyled href="/once-ui/components/structure">Flex + Grid</SmartLink>: improved unit support, translate props, border shorthand</>,
          <><SmartLink unstyled href="/once-ui/components/heading">Heading + Text</SmartLink>: family prop to override default variant</>,
          <><SmartLink unstyled href="/once-ui/form-controls/textarea">Textarea</SmartLink>: styled scrollbar</>,
        ]
      },
      {
        title: "Accessibility improvements",
        bullets: [
          <><SmartLink unstyled href="/once-ui/components/dropdownWrapper">DropdownWrapper</SmartLink>: improved scroll locking</>,
          <><SmartLink unstyled href="/once-ui/components/dialog">Dialog</SmartLink>: improved scroll locking and fix inert bug</>,
          <><SmartLink unstyled href="/once-ui/components/contextMenu">ContextMenu</SmartLink>: improved scroll locking</>,
        ],
      }
    ]
  },
  {
    date: "2025-10-19",
    title: "Once UI 1.5: Curiosity in code",
    image: "/images/changelog/once-ui-1-5.jpg",
    sections: [
      {
        title: "New components",
        bullets: [
          <><SmartLink unstyled href="/once-ui/components/hover">Hover</SmartLink>: Minimal component for overlaying elements</>,
          <><SmartLink unstyled href="/once-ui/components/animation">Animation</SmartLink>: Robust component for complex interactions</>,
          <><SmartLink unstyled href="/once-ui/components/hoverCard">HoverCard</SmartLink>: Portal-based element with Animation</>,
          <><SmartLink unstyled href="/once-ui/components/timeline">Timeline</SmartLink>: Static timeline with various data elements</>,
          <><SmartLink unstyled href="/once-ui/components/swiper">Swiper</SmartLink>: Multi-image with gestures and dragging</>,
          <><SmartLink unstyled href="/once-ui/effects/typeFx">TypeFx</SmartLink>: Typewriter-style animation</>,
          <><SmartLink unstyled href="/once-ui/effects/matrixFx">MatrixFx</SmartLink>: Canvas-based dot pattern animation</>,
          <><SmartLink unstyled href="/once-ui/effects/shineFx">ShineFx</SmartLink>: Shining text effect</>,
        ],
      },
      {
        title: "Component improvements",
        bullets: [
          <><SmartLink unstyled href="/once-ui/components/flex">Flex</SmartLink>: Custom breakpoint support, scrollbar customization, radius &apos;full&apos; for individual corners</>,
          <><SmartLink unstyled href="/once-ui/components/button">Button</SmartLink>: rounded prop for a fully rounded style (shorthand for data-border)</>,
          <><SmartLink unstyled href="/once-ui/components/background">Background</SmartLink>: Better visual rendering for background lines</>,
          <><SmartLink unstyled href="/once-ui/components/card">Card</SmartLink>: Improved border radius, removed hover effect on tap</>,
          <><SmartLink unstyled href="/once-ui/form-controls/input">Input</SmartLink>, <SmartLink unstyled href="/once-ui/form-controls/textarea">Textarea</SmartLink>: Native char count support for maxLength</>,
          <><SmartLink unstyled href="/once-ui/modules/megaMenu">MegaMenu</SmartLink>: Better animations, custom content support, less re-rendering</>,
          <><SmartLink unstyled href="/once-ui/components/icon">Icon</SmartLink>, <SmartLink unstyled href="/once-ui/components/iconButton">IconButton</SmartLink>, <SmartLink unstyled href="/once-ui/components/headingLink">HeadingLink</SmartLink>: Refactored with Animation component</>,
          <><SmartLink unstyled href="/once-ui/modules/headingNav">HeadingNav</SmartLink>: Default heading for element</>,
          <><SmartLink unstyled href="/once-ui/components/tooltip">Tooltip</SmartLink>: Fadein animation support</>,
          <><SmartLink unstyled href="/once-ui/components/heading">Heading</SmartLink>, <SmartLink unstyled href="/once-ui/components/text">Text</SmartLink>: Display size line-height adjustments and support for <InlineCode>xs</InlineCode> and <InlineCode>xl</InlineCode> label sizes</>,
          <><SmartLink unstyled href="/once-ui/effects/tiltFx">TiltFx</SmartLink>: Distortion amount support</>,
        ]
      },
      {
        title: "Accessibility improvements",
        bullets: [
          <><SmartLink unstyled href="/once-ui/components/dropdownWrapper">DropdownWrapper</SmartLink>: Scroll lock and better hover + arrow key handling</>,
          <><SmartLink unstyled href="/once-ui/components/emojiPicker">EmojiPicker</SmartLink>: Refactored scroll behavior and performance</>,
        ],
      }
    ]
  },
  {
    date: "2025-07-30",
    title: "Once UI 1.4: Next level devX",
    image: "/api/og/generate?title=Once UI 1.4&description=Next level devX",
    description: "Once UI v1.4 is here with new components and enhanced developer experience.",
    sections: [
      {
        title: "New components",
        bullets: [
          "List, ListItem",
          "ProgressBar",
          "CountFx",
          "ContextMenu",
        ],
      },
      {
        title: "Flex & Grid",
        bullets: [
          "Custom cursor",
          "Breakpoint object",
          "Dynamically render on server / client"
        ],
      },
      {
        title: "Improvements",
        bullets: [
          "Dropdown accessibility",
          "Multiselect for Select",
          "Autocollapse AccordionGroup",
          "Native Media caption",
        ]
      }
    ]
  },
  {
    date: "2025-06-28",
    title: "Magic Convert",
    image: "/images/docs/magic-convert.jpg",
    description: "New conversion-optimized landing page and dashboard template.",
    sections: [
      {
        title: "Features",
        bullets: [
          "Responsive design",
          "SEO-friendly",
          "Customizable",
          "Deployment-ready",
          "Modular structure"
        ],
        link: "https://once-ui.com/products/magic-convert"
      }
    ]
  },
  {
    date: "2025-06-17",
    title: "Once UI Hub",
    image: "/api/og/generate?title=Once UI Hub&description=New comment section",
    description: "Improvements to the Once UI Hub, including a new comment section.",
    sections: [
      {
        title: "Features",
        bullets: [
          "Comments: Start discussions and share feedback with the community",
        ],
        link: "https://once-ui.com/hub"
      }
    ]
  },
  {
    date: "2025-06-16",
    title: "Once UI Blocks",
    image: "/api/og/generate?title=Once UI Blocks&description=New blocks and page examples",
    description: "Improved dashboard page example and music player widget.",
    sections: [
      {
        title: "New block",
        bullets: [
          "MusicPlayer with controls and tracklist",
        ],
        link: "https://once-ui.com/blocks/widgets"
      },
      {
        title: "Improved page example",
        bullets: [
          "Dashboard page with new design and layout",
        ],
        link: "https://once-ui.com/blocks/dashboard"
      }
    ]
  },
  {
    date: "2025-06-14",
    title: "Once UI Core Migration",
    image: "/api/og/generate?title=Once UI Core Migration&description=Refact all Magic products to use Once UI Core",
    description: "All Magic products now use Once UI Core. The updates slashed 200k+ lines of code.",
    sections: [
      {
        title: "Products",
        bullets: [
          "Once UI Starter",
          "Magic Portfolio",
          "Magic Store",
          "Magic Docs",
          "Magic Bio",
        ],
        link: "https://once-ui.com/products"
      },
      {
        title: "Magic Bio",
        bullets: [
          "Brand new design and style",
          "Better OG data resolution"
        ],
        link: "https://once-ui.com/products/magic-bio"
      },
      {
        title: "Magic Docs",
        bullets: [
          "Improved style",
          "Sidebar bug fixes"
        ],
        link: "https://once-ui.com/products/magic-docs"
      }
    ]
  },
  {
    date: "2025-06-05",
    title: "Once UI Core",
    image: "/api/og/generate?title=Once UI Core&description=Official NPM package for Once UI",
    description: "Once UI Core, the official NPM package for Once UI is here.",
    sections: [
      {
        title: "Features",
        bullets: [
          "New providers for a more robust and scalable app-level theme management",
          "Import everything (components, hooks, utils) from a single source: @once-ui-system/core",
          "Improved directory structure with better separation between responsibilities"
        ],
        link: "https://www.npmjs.com/package/@once-ui-system/core"
      }
    ]
  },
  {
    date: "2025-05-29",
    title: "Once UI Data Viz Module",
    image: "/images/changelog/once-ui.jpg",
    description: "We've released the Once UI Data Viz module, a collection of components for creating beautiful charts and graphs.",
    sections: [
      {
        title: "Components",
        bullets: [
          "LineChart",
          "BarChart",
          "LineBarChart",
          "PieChart"
        ],
      },
      {
        title: "Features",
        bullets: [
          "Date selection",
          "Style and color variants",
          "Simple component APIs",
          "Responsive design"
        ],
        link: "/once-ui/data/setup"
      }
    ]
  },
  {
    date: "2025-05-14",
    title: "Once UI Core Docs",
    image: "/images/changelog/once-ui.jpg",
    description: "We rebuilt the Once UI Core docs from scratch with better, more comprehensive examples and use cases.",
    sections: [
      {
        title: "Features",
        bullets: [
          "Get started guides",
          "Component documentations",
          "Module documentations",
          "Comprehensive examples"
        ],
        link: "/once-ui/quick-start"
      }
    ]
  },
  {
    date: "2025-05-01",
    title: "Once UI Hub",
    image: "/api/og/generate?title=Once UI Hub&description=Share your work and connect with creatives",
    description: "We launched the Once UI Hub, a place to share your work and connect with other creatives.",
    sections: [
      {
        title: "Features",
        bullets: [
          "Share your Once UI projects",
          "Featured projects are automatically displayed on Once UI marketing pages",
        ],
        link: "https://once-ui.com/hub"
      }
    ]
  },
  {
    date: "2025-04-22",
    title: "Magic Portfolio 2.0",
    image: "/images/changelog/magic-portfolio.jpg",
    description: "The new version of Magic Portfolio introduces slick styling and refined UI.",
    sections: [
      {
        title: "Features",
        bullets: [
          "Improved styling",
          "Theme switcher",
          "Once UI 0.6 components",
          "Improved component support for MDX pages",
        ],
        link: "https://once-ui.com/products/magic-portfolio"
      }
    ]
  },
  {
    date: "2025-04-03",
    title: "Magic Store",
    image: "/images/changelog/magic-store.jpg",
    description: "Simple ecommerce template built on top of the Fourthwall API. Sell merch in minutes without dealing with inventory, payments, or shipping.",
    sections: [
      {
        title: "Features",
        bullets: [
          "Fully customized storefront by Once UI",
          "No backend, infrastructure provided by Fourthwall",
          "Production, payment and shipping handled by Fourthwall"
        ],
        link: "https://once-ui.com/products/magic-store"
      }
    ]
  },
  {
    date: "2025-03-29",
    title: "Once UI v0.6",
    image: "/images/changelog/once-ui.jpg",
    description: "Once UI v0.6 is here with new components and features to help you build faster with world-class UI.",
    sections: [
      {
        title: "Features",
        bullets: [
          "Low-code components: Kbar, MegaMenu, HeadingNav",
          "SEO tools: Schema, Meta",
          "New components: CompareImage, ThemeSwitcher"
        ],
        link: "https://once-ui.com"
      }
    ]
  },
  {
    date: "2025-03-09",
    image: "/images/changelog/magic-docs.jpg",
    title: "Magic Docs",
    description: "The simplest, most beautiful documentation for your awesome product.",
    sections: [
      {
        title: "Features",
        bullets: [
          "Automatic structure based on MDX files",
          "Automatic table of contents",
          "Advanced SEO through a simplified metadata + schema system"
        ],
        link: "https://once-ui.com/products/magic-docs"
      }
    ]
  },
  {
    date: "2025-02-27",
    image: "/images/changelog/magic-bio.jpg",
    title: "New template: Magic Bio",
    sections: [
      {
        title: "Features",
        bullets: [
          "Cover image, avatar and social links",
          "Support for links, videos, and YouTube embeds",
          "Automatic OG data resolution"
        ],
        link: "https://once-ui.com/products/magic-bio"
      }
    ]
  },
  {
    date: "2025-02-25",
    image: "/api/og/generate?title=Once UI Pro&description=New blocks and page examples",
    title: "Once UI Pro",
    sections: [
      {
        title: "New page examples",
        bullets: [
          "Careers",
          "Contact",
          "About"
        ]
      },
      {
        title: "New blocks",
        bullets: [
          "Authentication",
          "Plans",
          "Features",
        ],
        link: "https://once-ui.com/blocks"
      }
    ]
  },
  {
    date: "2025-02-19",
    image: "/api/og/generate?title=Once UI Pro&description=New blocks and page examples",
    title: "Once UI Pro",
    sections: [
      {
        title: "New page examples",
        bullets: [
          "Profile page"
        ]
      },
      {
        title: "New blocks",
        bullets: [
          "Newsletter",
          "Cookie banner",
          "FAQ",
          "Testimonial",
          "Gradient",
          "Blog post",
          "Testimonial"
        ],
        link: "https://once-ui.com/blocks"
      }
    ]
  },
];

export { changelog };