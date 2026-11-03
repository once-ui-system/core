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
import {
  HiBookmark,
  HiHeart,
  HiOutlineAcademicCap,
  HiOutlineBackward,
  HiOutlineBookOpen,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineCamera,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronUpDown,
  HiOutlineCommandLine,
  HiOutlineCpuChip,
  HiOutlineCube,
  HiOutlineDevicePhoneMobile,
  HiOutlineDocumentChartBar,
  HiOutlineDocumentDuplicate,
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineGlobeEuropeAfrica,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineLifebuoy,
  HiOutlineLightBulb,
  HiOutlineLockClosed,
  HiOutlineMap,
  HiOutlineMoon,
  HiOutlinePuzzlePiece,
  HiOutlineRectangleGroup,
  HiOutlineRocketLaunch,
  HiOutlineSquare2Stack,
  HiOutlineSquare3Stack3D,
  HiOutlineSquares2X2,
  HiOutlineSwatch,
  HiOutlineTrash,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineUsers,
  HiOutlineViewColumns,
} from "react-icons/hi2";
import { PiMedal, PiPersonArmsSpread, PiToggleLeft, PiTShirt } from "react-icons/pi";
import { RiDiscountPercentLine, RiVisaLine } from "react-icons/ri";

/**
 * The icons blocks use beyond the ones Once UI ships. Installing a block with
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
  accessibility: PiPersonArmsSpread,
  addPerson: HiOutlineUserPlus,
  amex: FaCcAmex,
  analytics: HiOutlineDocumentChartBar,
  api: HiOutlineCommandLine,
  apple: FaApple,
  backward: HiOutlineBackward,
  blocks: HiOutlineSquare3Stack3D,
  bookmarkFilled: HiBookmark,
  camera: HiOutlineCamera,
  card: HiOutlineIdentification,
  careers: HiOutlineBriefcase,
  chevronUpDown: HiOutlineChevronUpDown,
  chip: HiOutlineCpuChip,
  collaboration: HiOutlineUserGroup,
  componentLibrary: HiOutlineRectangleGroup,
  conversation: HiOutlineChatBubbleLeftRight,
  cube: HiOutlineCube,
  darkMode: HiOutlineMoon,
  delete: HiOutlineTrash,
  designTokens: HiOutlineSwatch,
  discord: FaDiscord,
  discount: RiDiscountPercentLine,
  discover: FaCcDiscover,
  documentation: HiOutlineBookOpen,
  email: HiOutlineEnvelope,
  enterprise: HiOutlineBuildingOffice2,
  europe: HiOutlineGlobeEuropeAfrica,
  github: FaGithub,
  google: FaGoogle,
  grid: HiOutlineSquares2X2,
  heartFilled: HiHeart,
  integration: HiOutlinePuzzlePiece,
  key: HiOutlineKey,
  learn: HiOutlineAcademicCap,
  lifering: HiOutlineLifebuoy,
  lightbulb: HiOutlineLightBulb,
  linkedin: FaLinkedin,
  lockClosed: HiOutlineLockClosed,
  map: HiOutlineMap,
  mastercard: FaCcMastercard,
  medal: PiMedal,
  page: HiOutlineDocumentText,
  pages: HiOutlineDocumentDuplicate,
  password: HiOutlineKey,
  people: HiOutlineUsers,
  responsive: HiOutlineDevicePhoneMobile,
  rocket: HiOutlineRocketLaunch,
  squareStack: HiOutlineSquare2Stack,
  threads: FaThreads,
  toggle: PiToggleLeft,
  truck: HiOutlineTruck,
  tshirt: PiTShirt,
  viewColumns: HiOutlineViewColumns,
  visa: RiVisaLine,
} satisfies Record<string, IconType>;

declare module "@once-ui-system/core" {
  interface IconLibraryOverrides extends Record<keyof typeof blockIcons, true> {}
}
