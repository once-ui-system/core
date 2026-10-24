import type { MenuGroup } from "@once-ui-system/core";

// Header menus: `megaMenu` on desktop, `mobileMenu` in the drawer.
const megaMenu: MenuGroup[] = [{ id: "blog", label: "Blog", href: "/blog" }];

const mobileMenu: MenuGroup[] = [
  ...megaMenu,
  { id: "signin", label: "Sign in", href: "/auth" },
  { id: "privacy", label: "Privacy", href: "/privacy" },
  { id: "terms", label: "Terms", href: "/terms" },
];

export { megaMenu, mobileMenu };
