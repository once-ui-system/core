import type { IconName as OnceUIIconName } from "@once-ui-system/core";
import type { IconType } from "react-icons";
import { FaMailchimp } from "react-icons/fa6";
import {
  HiArrowUpRight,
  HiCalendar,
  HiEyeDropper,
  HiMiniMinus,
  HiMiniPlus,
  HiMiniXMark,
  HiOutlineAcademicCap,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArchiveBox,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowUp,
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineBolt,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineClipboard,
  HiOutlineClock,
  HiOutlineCodeBracket,
  HiOutlineCog6Tooth,
  HiOutlineComputerDesktop,
  HiOutlineCube,
  HiOutlineDevicePhoneMobile,
  HiOutlineDocumentDuplicate,
  HiOutlineExclamationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineHeart,
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlineLanguage,
  HiOutlineLink,
  HiOutlineMagnifyingGlass,
  HiOutlineMap,
  HiOutlinePaintBrush,
  HiOutlinePause,
  HiOutlinePencil,
  HiOutlinePhoto,
  HiOutlinePlay,
  HiOutlinePresentationChartLine,
  HiOutlineQuestionMarkCircle,
  HiOutlineQueueList,
  HiOutlineShieldCheck,
  HiOutlineShoppingCart,
  HiOutlineSparkles,
  HiOutlineSquare3Stack3D,
  HiOutlineSquares2X2,
  HiOutlineTrophy,
  HiOutlineUser,
} from "react-icons/hi2";
import { LiaCubesSolid } from "react-icons/lia";
import { LuChevronsLeftRight } from "react-icons/lu";
import { PiRuler, PiToggleLeft } from "react-icons/pi";
import { RiOpenaiFill } from "react-icons/ri";
import { SiClaude } from "react-icons/si";
import { blockIcons } from "@/blocks/modules/blockIcons";

export const iconLibrary = {
  ...blockIcons,
  openai: RiOpenaiFill,
  claude: SiClaude,
  chevronsLeftRight: LuChevronsLeftRight,
  computer: HiOutlineComputerDesktop,
  mobile: HiOutlineDevicePhoneMobile,
  help: HiOutlineQuestionMarkCircle,
  info: HiOutlineInformationCircle,
  warning: HiOutlineExclamationTriangle,
  danger: HiOutlineExclamationCircle,
  checkbox: HiOutlineCheck,
  check: HiOutlineCheckCircle,
  play: HiOutlinePlay,
  pause: HiOutlinePause,
  eyeDropper: HiEyeDropper,
  code: HiOutlineCodeBracket,
  clipboard: HiOutlineClipboard,
  person: HiOutlineUser,
  settings: HiOutlineCog6Tooth,
  logout: HiOutlineArrowRightOnRectangle,
  close: HiMiniXMark,
  openLink: HiOutlineLink,
  apps: HiOutlineSquares2X2,
  arrowUpRight: HiArrowUpRight,
  minus: HiMiniMinus,
  plus: HiMiniPlus,
  calendar: HiCalendar,
  eye: HiOutlineEye,
  eyeOff: HiOutlineEyeSlash,
  search: HiOutlineMagnifyingGlass,
  notification: HiOutlineBell,
  security: HiOutlineShieldCheck,
  sparkle: HiOutlineSparkles,
  home: HiOutlineHome,
  scholar: HiOutlineAcademicCap,
  queue: HiOutlineQueueList,
  image: HiOutlinePhoto,
  roadmap: HiOutlineMap,
  changelog: HiOutlineClock,
  config: HiOutlineAdjustmentsHorizontal,
  mailchimp: FaMailchimp,
  style: HiOutlinePaintBrush,
  chat: HiOutlineChatBubbleLeftRight,
  like: HiOutlineHeart,
  project: HiOutlineSquare3Stack3D,
  article: HiOutlineQueueList,
  language: HiOutlineLanguage,
  components: HiOutlineCube,
  sidebar: HiOutlineBars3,
  cart: HiOutlineShoppingCart,
  ruler: PiRuler,
  edit: HiOutlinePencil,
  copy: HiOutlineDocumentDuplicate,
  switch: PiToggleLeft,
  modules: LiaCubesSolid,
  barChart: HiOutlineChartBar,
  lineChart: HiOutlineArrowTrendingUp,
  pieChart: HiOutlineChartPie,
  lineBarChart: HiOutlinePresentationChartLine,
  package: HiOutlineArchiveBox,
  arrowUp: HiOutlineArrowUp,
  bolt: HiOutlineBolt,
  linearGauge: HiOutlineChartBar,
  radialGauge: HiOutlineChartPie,
  basics: HiOutlineCube,

  // The names the blocks (src/blocks) and the MDX pages use. They compiled
  // while this object was typed `Record<string, IconType>`, which let any
  // name through, and rendered nothing. (MDX is not type-checked: a name
  // there only shows up as a "does not exist" warning in the build.)
  layers: HiOutlineSquare3Stack3D,
  trophy: HiOutlineTrophy,
} satisfies Record<string, IconType>;

export type IconLibrary = typeof iconLibrary;
/** Every name an `Icon` takes in the docs: Once UI's own and the ones above. */
export type IconName = OnceUIIconName;
// Teach Once UI the names registered above, so `<Icon name="rocket" />` and
// friends type-check instead of silently rendering nothing. Derived from the
// object itself, so it cannot drift. The object is checked with `satisfies`
// rather than annotated: `Record<string, IconType>` as its type widened the
// keys to `string`, so every name, typos included, compiled.
declare module "@once-ui-system/core" {
  interface IconLibraryOverrides extends Record<keyof typeof iconLibrary, true> {}
}
