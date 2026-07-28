import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
type MDXComponents = React.ComponentProps<typeof MDXRemote>["components"];
import React, { ReactNode } from "react";

// ─── Core components (explicit imports to avoid Turbopack frozen module proxy) ───
import {
  Accordion,
  AccordionGroup,
  Animation,
  Arrow,
  AutoScroll,
  Avatar,
  AvatarGroup,
  Badge,
  Background,
  Banner,
  BlobFx,
  BlockQuote,
  Button,
  Card,
  Carousel,
  CelebrationFx,
  Checkbox,
  Chip,
  ClientFlex,
  ClientGrid,
  ColorInput,
  Column,
  CompareImage,
  ContextMenu,
  CountFx,
  CountdownFx,
  Cursor,
  CursorCard,
  DateInput,
  DatePicker,
  DateRangeInput,
  DateRangePicker,
  Dialog,
  Dropdown,
  DropdownWrapper,
  ElementType,
  EmojiPicker,
  EmojiPickerDropdown,
  Fade,
  FadingLettersFx,
  Feedback,
  Flex,
  FlipFx,
  FocusTrap,
  GlitchFx,
  Grid,
  Heading,
  HoloFx,
  Hover,
  HoverCard,
  Icon,
  IconButton,
  InfiniteScroll,
  InlineCode,
  Input,
  InteractiveDetails,
  Kbd,
  LetterFx,
  Line,
  List,
  ListItem,
  Logo,
  LogoCloud,
  Mask,
  MasonryGrid,
  MatrixFx,
  Media,
  Modal,
  NavIcon,
  NumberInput,
  OgCard,
  Option,
  OTPInput,
  Particle,
  PasswordInput,
  ProgressBar,
  Pulse,
  RadioButton,
  RevealFx,
  Row,
  ScrollContainer,
  ScrollLock,
  ScrollToTop,
  Scroller,
  SegmentedControl,
  Select,
  ShineFx,
  Skeleton,
  Slider,
  SmartLink,
  Spinner,
  SplitView,
  StatusIndicator,
  StyleOverlay,
  StylePanel,
  Swiper,
  Switch,
  Table,
  Tag,
  TagInput,
  Text,
  Textarea,
  ThemeInit,
  ThemeSwitcher,
  TiltFx,
  Timeline,
  Toast,
  Toaster,
  ToggleButton,
  Tooltip,
  TypeFx,
  User,
  UserMenu,
  WeatherFx,
} from "@once-ui-system/core";
import type { MediaProps, TextProps } from "@once-ui-system/core";

// Modules (CodeBlock, HeadingLink, charts, etc.)
import {
  CodeBlock,
  HeadingLink,
  BarChart,
  LineChart,
  PieChart,
  LineBarChart,
  RadialGauge,
  LinearGauge,
  ChartHeader,
  Kbar,
  MegaMenu,
  MobileMegaMenu,
} from "@once-ui-system/core";

// ─── Product components (explicit imports, skip `Modal` which conflicts with core) ───
import {
  PropsTable,
  ClientOption,
  ColorSchemeGrid,
  SemanticColorSections,
  AdditionalTokens,
  Cta,
  Products,
  PageList,
  AnimationNavIconExample,
  CountFxExample,
  ScrollCountExample,
  CountFxDecimalExample,
  CelebrationFxExample,
  MatrixFxExample,
  WeatherFxExample,
  LineChartStreamingExample,
  InfiniteScrollExample,
  ProgressBarExample,
  ToastExample,
  TypeFxCustomExample,
  ModalExample,
  ModalWithBackdrop,
  BasicDialog,
  DialogWithFooter,
  StackedDialogs,
  DialogFlush,
  CustomizedDialog,
  DialogCloseOnClickaway,
  BasicDatePickerExample,
  DateTimePickerExample,
  DateRangePickerExample,
  DateRangePickerPresetsExample,
  BasicDateRangeInputExample,
  CustomLabelDateRangeInputExample,
  DateRangeInputExamples,
  ValidationInputExample,
  CharacterCountExample,
  SearchInput,
  ColorInputExample,
  ColorInputAlphaExample,
  DateInputExample,
  DateTimeInputExample,
  NumberInputExample,
  OTPInputExample,
  PasswordInputExample,
  TagInputExample,
  ValidationTextareaExample,
  TextareaCharacterCountExample,
  BasicSwitch,
  SwitchWithFeedback,
  SwitchWithLoading,
  ReversedSwitch,
  ClientSwitch,
  SubscriptionRadioGroup,
  BasicRawDropdown,
  IconsRawDropdown,
  DescriptionRawDropdown,
  CustomStyledRawDropdown,
  BasicDropdown,
  DropdownWithIcons,
  CustomPositionDropdown,
  SearchableDropdown,
  BasicEmojiPickerDropdown,
  IconButtonEmojiPickerDropdown,
  CustomColumnsEmojiPickerDropdown,
  PlacementEmojiPickerDropdown,
  CustomBackgroundEmojiPickerDropdown,
  ControlledEmojiPickerDropdown,
  NavIconToggle,
  NavIconStates,
  CustomNavIcon,
  SliderBasicExample,
  SliderLabelExample,
  SliderShowValueExample,
  SliderStepExample,
  SliderMinMaxExample,
  SliderDisabledExample,
  RadialGaugeSpeedDemo,
  CountdownFxBasic,
  CountdownFxFormats,
  CountdownFxEffects,
  CountdownFxLaunch,
  CountdownFxOnComplete,
  IndeterminateCheckboxExample,
  BasicChipExample,
  InteractiveChipExample,
  ChipWithIconsExample,
  RemovableChipsExample,
  CustomRemovableChipExample,
  InteractiveDetailsExample,
  FormControlsExample,
  TooltipExample,
} from "@/product";

// ─── Custom MDX element overrides ───

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

function CustomLink({ href, children, ...props }: CustomLinkProps) {
  return (
    <SmartLink href={href} {...props} style={{ textDecoration: "underline" }}>
      {children}
    </SmartLink>
  );
}

function createImage({ alt, src, ...props }: MediaProps & { src: string }) {
  if (!src) {
    console.error("Media requires a valid 'src' property.");
    return null;
  }

  return (
    <Media
      marginTop="8"
      marginBottom="16"
      enlarge
      radius="m"
      aspectRatio="16 / 9"
      border="neutral-alpha-medium"
      sizes="(max-width: 960px) 100vw, 960px"
      alt={alt}
      src={src}
      {...props}
    />
  );
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function createHeading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  const CustomHeading = ({
    children,
    ...props
  }: Omit<React.ComponentProps<typeof HeadingLink>, "as" | "id">) => {
    const slug = slugify(children as string);
    return (
      <HeadingLink
        marginTop="24"
        marginBottom="12"
        as={as}
        id={slug}
        {...props}
      >
        {children}
      </HeadingLink>
    );
  };

  CustomHeading.displayName = `${as}`;
  return CustomHeading;
}

function createParagraph({ children }: TextProps) {
  return (
    <Text
      style={{ lineHeight: "175%" }}
      variant="body-default-m"
      onBackground="neutral-strong"
      marginTop="8"
      marginBottom="12"
    >
      {children}
    </Text>
  );
}

function createInlineCode({ children }: { children: ReactNode }) {
  return <InlineCode onBackground="neutral-strong">{children}</InlineCode>;
}

function createBlockQuote({ children }: { children: ReactNode }) {
  return (
    <BlockQuote marginTop="8" marginBottom="12">
      {children}
    </BlockQuote>
  );
}

function createList({ children }: { children: ReactNode }) {
  return <List>{children}</List>;
}

function createListItem({ children }: { children: ReactNode }) {
  return (
    <ListItem marginTop="4" marginBottom="8" style={{ lineHeight: "175%" }}>
      {children}
    </ListItem>
  );
}

function createCodeBlock(props: any) {
  if (
    props.children &&
    props.children.props &&
    props.children.props.className
  ) {
    const { className, children } = props.children.props;
    const language = className.replace("language-", "");
    const label = language.charAt(0).toUpperCase() + language.slice(1);

    return (
      <CodeBlock
        marginTop="8"
        marginBottom="16"
        codes={[{ code: children, language, label }]}
        copyButton={true}
      />
    );
  }
  return <pre {...props} />;
}

function createHr() {
  return <Line />;
}

const mdxComponents = {
  // ─── MDX element overrides ───
  p: createParagraph,
  h1: createHeading("h1"),
  h2: createHeading("h2"),
  h3: createHeading("h3"),
  h4: createHeading("h4"),
  h5: createHeading("h5"),
  h6: createHeading("h6"),
  img: createImage,
  a: CustomLink,
  code: createInlineCode,
  pre: createCodeBlock,
  blockquote: createBlockQuote,
  ul: createList,
  ol: createList,
  li: createListItem,
  hr: createHr,

  // ─── Core layout ───
  Flex,
  Row,
  Column,
  Grid,
  ServerFlex: ClientFlex,
  ServerGrid: ClientGrid,

  // ─── Core typography & display ───
  Text,
  Heading,
  InlineCode,
  CodeBlock,
  HeadingLink,
  Logo,
  LogoCloud,
  Kbd,

  // ─── Core media ───
  Media,
  Background,
  Mask,
  Swiper,
  Carousel,
  MasonryGrid,
  CompareImage,
  AutoScroll,

  // ─── Core actions ───
  Button,
  IconButton,
  ToggleButton,
  SmartLink,
  Option,

  // ─── Core data display ───
  Avatar,
  AvatarGroup,
  Badge,
  Tag,
  Table,
  List,
  ListItem,
  Timeline,
  User,
  UserMenu,
  BlockQuote,
  Line,
  ProgressBar,
  StatusIndicator,
  Tooltip,
  HoverCard,
  OgCard,
  Card,
  CursorCard,
  Feedback,

  // ─── Core form controls ───
  Input,
  NumberInput,
  PasswordInput,
  OTPInput,
  Textarea,
  Select,
  Switch,
  Checkbox,
  RadioButton,
  Chip,
  Slider,
  DatePicker,
  DateInput,
  DateRangeInput,
  DateRangePicker,
  ColorInput,
  TagInput,
  InteractiveDetails,
  SegmentedControl,
  ElementType,
  ContextMenu,
  Dropdown,
  DropdownWrapper,
  EmojiPicker,
  EmojiPickerDropdown,

  // ─── Core navigation ───
  NavIcon,
  Arrow,
  ScrollToTop,
  Scroller,
  ScrollContainer,
  InfiniteScroll,
  SplitView,
  Kbar,
  MegaMenu,
  MobileMegaMenu,

  // ─── Core overlay ───
  Dialog,
  Modal,
  Toast,
  Toaster,
  Spinner,
  Skeleton,
  FocusTrap,
  ScrollLock,
  StyleOverlay,
  StylePanel,
  ThemeSwitcher,
  ThemeInit,

  // ─── Core effects ───
  Animation,
  Fade,
  RevealFx,
  FlipFx,
  GlitchFx,
  HoloFx,
  TiltFx,
  ShineFx,
  Pulse,
  LetterFx,
  FadingLettersFx,
  TypeFx,
  CountFx,
  CountdownFx,
  BlobFx,
  Particle,
  Cursor,
  Hover,
  MatrixFx,
  WeatherFx,
  CelebrationFx,

  // ─── Core data visualization ───
  BarChart,
  LineChart,
  PieChart,
  LineBarChart,
  RadialGauge,
  LinearGauge,
  ChartHeader,

  // ─── Product components ───
  PropsTable,
  ClientOption,
  ColorSchemeGrid,
  SemanticColorSections,
  AdditionalTokens,
  Cta,
  Products,
  PageList,
  AnimationNavIconExample,
  CountFxExample,
  ScrollCountExample,
  CountFxDecimalExample,
  CelebrationFxExample,
  MatrixFxExample,
  WeatherFxExample,
  LineChartStreamingExample,
  InfiniteScrollExample,
  ProgressBarExample: ProgressBarExample,
  ToastExample,
  TypeFxCustomExample,
  ModalExample,
  ModalWithBackdrop,
  BasicDialog,
  DialogWithFooter,
  StackedDialogs,
  DialogFlush,
  CustomizedDialog,
  DialogCloseOnClickaway,
  BasicDatePickerExample,
  DateTimePickerExample,
  DateRangePickerExample,
  DateRangePickerPresetsExample,
  BasicDateRangeInputExample,
  CustomLabelDateRangeInputExample,
  DateRangeInputExamples,
  ValidationInputExample,
  CharacterCountExample,
  SearchInput,
  ColorInputExample,
  ColorInputAlphaExample,
  DateInputExample,
  DateTimeInputExample,
  NumberInputExample,
  OTPInputExample,
  PasswordInputExample,
  TagInputExample,
  ValidationTextareaExample,
  TextareaCharacterCountExample,
  BasicSwitch,
  SwitchWithFeedback,
  SwitchWithLoading,
  ReversedSwitch,
  ClientSwitch,
  SubscriptionRadioGroup,
  BasicRawDropdown,
  IconsRawDropdown,
  DescriptionRawDropdown,
  CustomStyledRawDropdown,
  BasicDropdown,
  DropdownWithIcons,
  CustomPositionDropdown,
  SearchableDropdown,
  BasicEmojiPickerDropdown,
  IconButtonEmojiPickerDropdown,
  CustomColumnsEmojiPickerDropdown,
  PlacementEmojiPickerDropdown,
  CustomBackgroundEmojiPickerDropdown,
  ControlledEmojiPickerDropdown,
  NavIconToggle,
  NavIconStates,
  CustomNavIcon,
  SliderBasicExample,
  SliderLabelExample,
  SliderShowValueExample,
  SliderStepExample,
  SliderMinMaxExample,
  SliderDisabledExample,
  RadialGaugeSpeedDemo,
  CountdownFxBasic,
  CountdownFxFormats,
  CountdownFxEffects,
  CountdownFxLaunch,
  CountdownFxOnComplete,
  IndeterminateCheckboxExample,
  BasicChipExample,
  InteractiveChipExample,
  ChipWithIconsExample,
  RemovableChipsExample,
  CustomRemovableChipExample,
  InteractiveDetailsExample,
  FormControlsExample,
  TooltipExample,
};

type CustomMDXProps = Omit<MDXRemoteProps, "components"> & {
  components?: Partial<MDXComponents>;
};

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      options={{ blockJS: false }}
      components={{
        ...mdxComponents,
        ...(props.components || {}),
      }}
    />
  );
}
