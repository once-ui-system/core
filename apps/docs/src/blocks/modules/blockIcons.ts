import { type IconComponent, iconLibrary as once } from "@once-ui-system/core";
import type { IconType } from "react-icons";
import {
  FaApple,
  FaCcAmex,
  FaCcDiscover,
  FaCcMastercard,
  FaDiscord,
  FaGithub,
  FaGoogle,
  FaLinkedin,
  FaThreads,
} from "react-icons/fa6";
import { HiBookmark, HiHeart } from "react-icons/hi2";
import { RiVisaLine } from "react-icons/ri";

/**
 * The icons blocks use beyond the ones Once UI ships. Generic names point at
 * Once UI's own glyphs, so blocks look like the rest of the system; only brand
 * marks and the filled heart and bookmark come from react-icons. Never add a
 * name Once UI already ships here: this object is spread after the app's own
 * icons and would replace them.
 * Installing a block with
 * `once-ui add` brings this file along; register it next to your own icons:
 *
 * ```tsx
 * <IconProvider icons={{ ...iconLibrary, ...blockIcons }}>
 * ```
 *
 * The augmentation below makes the names type-check wherever this file is part
 * of the program, so a block compiles before you register them; until you do,
 * those icons render empty.
 */
export const blockIcons = {
  // Brand marks Once UI does not draw.
  amex: FaCcAmex,
  apple: FaApple,
  discord: FaDiscord,
  discover: FaCcDiscover,
  github: FaGithub,
  google: FaGoogle,
  linkedin: FaLinkedin,
  mastercard: FaCcMastercard,
  threads: FaThreads,
  visa: RiVisaLine,
  // Filled variants.
  bookmarkFilled: HiBookmark,
  heartFilled: HiHeart,
  // Older block names for Once UI's own glyphs.
  addPerson: once.personAdd,
  analytics: once.report,
  api: once.terminal,
  blocks: once.layers,
  card: once.idCard,
  careers: once.briefcase,
  chip: once.cpu,
  collaboration: once.people,
  componentLibrary: once.layout,
  conversation: once.chat,
  darkMode: once.dark,
  delete: once.trash,
  designTokens: once.swatch,
  discount: once.tag,
  documentation: once.book,
  email: once.mail,
  enterprise: once.organization,
  europe: once.world,
  integration: once.puzzle,
  learn: once.academicCap,
  lifering: once.lifebuoy,
  lockClosed: once.lock,
  page: once.document,
  pages: once.file,
  password: once.key,
  responsive: once.mobile,
  squareStack: once.stack,
  viewColumns: once.columns,
} satisfies Record<string, IconType | IconComponent>;

declare module "@once-ui-system/core" {
  interface IconLibraryOverrides extends Record<keyof typeof blockIcons, true> {}
}
