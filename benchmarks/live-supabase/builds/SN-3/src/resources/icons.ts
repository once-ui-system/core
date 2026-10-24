import type { IconLibrary } from "@once-ui-system/core";

export type { IconName } from "@once-ui-system/core";

import {
  HiOutlineArrowDownTray,
  HiOutlineArrowUturnLeft,
  HiOutlineArrowUturnRight,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineCommandLine,
  HiOutlineCreditCard,
  HiOutlineDevicePhoneMobile,
  HiOutlineDocumentDuplicate,
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiOutlineLightBulb,
  HiOutlinePaintBrush,
  HiOutlinePencil,
  HiOutlineRocketLaunch,
  HiOutlineScissors,
  HiOutlineLockOpen,
  HiOutlineMap,
  HiOutlineShieldCheck,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineTruck,
  HiOutlineUserGroup,
} from "react-icons/hi2";

import { PiTShirt } from "react-icons/pi";

import {
  FaGithub,
  FaGoogle,
  FaLinkedin,
  FaDiscord,
  FaThreads,
} from "react-icons/fa6";

import { HiOutlineCode, HiOutlineGlobe, HiOutlineMail, HiOutlineTrendingDown, HiOutlineTrendingUp, HiOutlineViewGrid } from "react-icons/hi";


/**
 * Icons the app registers on top of the built-in set. In 2.0 `IconName` is a
 * real union, so every custom name is declared here first: a name missing
 * from this augmentation is a type error at the call site, not a blank icon
 * at runtime. Add the name here and the component below, in that order.
 */
declare module "@once-ui-system/core" {
  interface IconLibraryOverrides {
    rocket: true;
    github: true;
    google: true;
    linkedin: true;
    discord: true;
    threads: true;
    edit: true;
    settings: true;
    logout: true;
    book: true;
    trendUp: true;
    trendDown: true;
    email: true;
    document: true;
    home: true;
    code: true;
    pages: true;
    trend: true;
    chat: true;
    style: true;
    people: true;
    shop: true;
    lightbulb: true;
    globe: true;
    apps: true;
    download: true;
    swatch: true;
    cart: true;
    bag: true;
    delivery: true;
    quality: true;
    tshirt: true;
    changelog: true;
    roadmap: true;
    undo: true;
    redo: true;
    scissors: true;
    unlock: true;
    card: true;
    devices: true;
    terminal: true;
  }
}

export const iconLibrary: Partial<IconLibrary> = {
  rocket: HiOutlineRocketLaunch,
  github: FaGithub,
  google: FaGoogle,
  linkedin: FaLinkedin,
  discord: FaDiscord,
  threads: FaThreads,
  edit: HiOutlinePencil,
  settings: HiOutlineCog6Tooth,
  logout: HiOutlineArrowRightOnRectangle,
  book: HiOutlineBookOpen,
  trendUp: HiOutlineTrendingUp,
  trendDown: HiOutlineTrendingDown,
  email: HiOutlineMail,
  document: HiOutlineDocumentDuplicate,
  home: HiOutlineHome,
  search: HiOutlineMagnifyingGlass,
  code: HiOutlineCode,
  pages: HiOutlineDocumentDuplicate,
  trend: HiOutlineTrendingUp,
  chat: HiOutlineChatBubbleLeftRight,
  style: HiOutlinePaintBrush,
  people: HiOutlineUserGroup,
  shop: HiOutlineShoppingCart,
  lightbulb: HiOutlineLightBulb,
  globe: HiOutlineGlobe,
  apps: HiOutlineViewGrid,
  download: HiOutlineArrowDownTray,
  swatch: HiOutlinePaintBrush,
  // Storefront surface
  cart: HiOutlineShoppingCart,
  bag: HiOutlineShoppingBag,
  delivery: HiOutlineTruck,
  quality: HiOutlineShieldCheck,
  tshirt: PiTShirt,
  // Docs surface
  changelog: HiOutlineClock,
  roadmap: HiOutlineMap,
  // Editor surface
  undo: HiOutlineArrowUturnLeft,
  redo: HiOutlineArrowUturnRight,
  scissors: HiOutlineScissors,
  unlock: HiOutlineLockOpen,
  // Landing surface
  card: HiOutlineCreditCard,
  devices: HiOutlineDevicePhoneMobile,
  terminal: HiOutlineCommandLine,
};
