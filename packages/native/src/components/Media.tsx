import { forwardRef, type ReactNode, useState } from "react";
import { Image, type ImageResizeMode, Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, flexStyle } from "./Flex";
import type { RefComponent, ViewRef, Writable } from "./refs";
import { Skeleton } from "./Skeleton";
import { Text } from "./Text";

export interface MediaProps extends Omit<FlexProps, "children"> {
  src: string;
  /** Read out by screen readers; an empty `alt` marks the image decorative, as on the web. */
  alt?: string;
  /** `"16 / 9"`, `"1"`, … as in core; `"original"` takes the image's own ratio once it loads. */
  aspectRatio?: string;
  /** In rem, used when there is no `aspectRatio`. */
  height?: number;
  /** Shows the skeleton instead of the image. */
  loading?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /** Fills the box it is in, ignoring `aspectRatio`. */
  stretch?: boolean;
  caption?: ReactNode;
  /** Makes the image pressable. Core calls it `onClick`; both work. */
  onPress?: () => void;
  onClick?: () => void;
}

// CSS `object-fit` as React Native's `resizeMode`.
const RESIZE: Record<NonNullable<MediaProps["objectFit"]>, ImageResizeMode> = {
  cover: "cover",
  contain: "contain",
  fill: "stretch",
  none: "center",
  "scale-down": "contain",
};

/** `"16 / 9"` as `16 / 9`; undefined for `"original"` or anything unreadable. */
export function parseAspectRatio(value: string | undefined): number | undefined {
  if (!value || value === "original") return undefined;
  const [w, h = "1"] = value.split("/").map((part) => part.trim());
  const ratio = Number(w) / Number(h);
  return Number.isFinite(ratio) && ratio > 0 ? ratio : undefined;
}

/**
 * Core's `Media` for images: a clipped box at `aspectRatio` with a skeleton
 * until the image loads. Core's enlarge overlay, video and YouTube embeds are left out.
 */
export const Media: RefComponent<MediaProps, ViewRef> = forwardRef<ViewRef, MediaProps>(
  function Media(
    {
      src,
      alt = "",
      aspectRatio = "original",
      height,
      loading = false,
      objectFit = "cover",
      stretch = false,
      fillWidth = true,
      caption,
      onPress,
      onClick,
      ...props
    },
    ref,
  ) {
    const theme = useTheme();
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    // React Native reports the image's size on load; the web build does not.
    const [natural, setNatural] = useState<number>();
    const {
      style: flex,
      rest,
      userStyle,
      hidden,
    } = flexStyle(theme, {
      direction: "column",
      overflow: "hidden",
      fillWidth,
      ...props,
    });

    if (hidden) return null;

    const ratio = parseAspectRatio(aspectRatio) ?? natural;
    const box: Writable<ViewStyle> = { ...flex };
    if (stretch) {
      box.width = "100%";
      box.height = "100%";
    } else if (ratio) {
      box.aspectRatio = ratio;
    } else {
      // Room for the skeleton until the image says how tall it is.
      box.height = height !== undefined ? theme.space(height) : theme.space("80");
    }
    const radius = flex.borderRadius;
    const fill = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 } as const;
    const busy = loading || (!loaded && !failed);

    const content = (
      <>
        {!loading && (
          <Image
            source={{ uri: src }}
            accessible={!!alt}
            accessibilityRole={alt ? "image" : undefined}
            accessibilityLabel={alt || undefined}
            aria-hidden={!alt}
            resizeMode={RESIZE[objectFit]}
            onLoad={(e) => {
              const size = (e?.nativeEvent as { source?: { width?: number; height?: number } })
                ?.source;
              if (size?.width && size?.height) setNatural(size.width / size.height);
              setLoaded(true);
            }}
            onError={() => setFailed(true)}
            style={fill}
          />
        )}
        {busy && (
          <Skeleton
            shape="block"
            width="100%"
            height="100%"
            style={{ ...fill, ...(radius !== undefined ? { borderRadius: radius } : {}) }}
          />
        )}
      </>
    );

    const handler = onPress ?? onClick;
    const media = handler ? (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        aria-label={alt || undefined}
        aria-busy={busy}
        onPress={handler}
        {...rest}
        style={({ pressed }) => [box, pressed && { opacity: 0.8 }, userStyle]}
      >
        {content}
      </Pressable>
    ) : (
      <View ref={ref} aria-busy={busy} {...rest} style={[box, userStyle]}>
        {content}
      </View>
    );

    if (!caption) return media;
    return (
      <View style={{ alignSelf: fillWidth ? "stretch" : "flex-start" }}>
        {media}
        <Text
          variant="label-default-s"
          onBackground="neutral-weak"
          align="center"
          paddingY="12"
          paddingX="24"
        >
          {caption}
        </Text>
      </View>
    );
  },
);
