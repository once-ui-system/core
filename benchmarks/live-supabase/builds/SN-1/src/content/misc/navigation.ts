import type { MenuGroup } from "@once-ui-system/core";

// Header menus: `megaMenu` on desktop, `mobileMenu` in the drawer. A group
// with `href` is a plain link; add `sections` to turn one into a dropdown.
const megaMenu: MenuGroup[] = [
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "signin", label: "Sign in", href: "/auth" },
];

const mobileMenu: MenuGroup[] = megaMenu;

export { megaMenu, mobileMenu };
