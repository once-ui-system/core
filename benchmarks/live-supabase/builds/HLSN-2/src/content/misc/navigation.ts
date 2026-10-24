import type { MenuGroup } from "@once-ui-system/core";

// Header menus: `megaMenu` on desktop, `mobileMenu` in the drawer. A group
// with `href` is a plain link; add `sections` to turn one into a dropdown.
const megaMenu: MenuGroup[] = [
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "pricing", label: "Pricing", href: "/pricing" },
  { id: "about", label: "About", href: "/about" },
  { id: "contact", label: "Contact", href: "/contact" },
];

const mobileMenu: MenuGroup[] = [
  ...megaMenu,
  {
    id: "legal",
    label: "Legal",
    suffixIcon: "chevronDown",
    sections: [
      {
        links: [
          { label: "Terms of Use", href: "/terms-of-use", icon: "pages" },
          { label: "Privacy Policy", href: "/privacy-policy", icon: "pages" },
        ],
      },
    ],
  },
];

export { megaMenu, mobileMenu };
