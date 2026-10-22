import { forwardRef, type ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  Text as RNText,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { DropdownWrapper } from "./DropdownWrapper";
import { type FlexProps, Row } from "./Flex";
import { IconButton } from "./IconButton";
import { useReduceMotion } from "./motion";
import {
  BURST_ANGLES,
  gestureTrack,
  REACTION_GESTURES,
  type ReactionMotion,
  type ReactionOption,
  reactionLabel,
  reactionMotion,
} from "./reactionMotion";
import type { RefComponent, ViewRef } from "./refs";
import { Text } from "./Text";
import { touchSlop } from "./touch";

type GlyphSize = "s" | "m" | "l" | "xl";

/** Glyph sizes in rem, as core's `--reaction-size`. */
const GLYPH_REM: Record<GlyphSize, number> = { s: 1, m: 1.25, l: 1.5, xl: 2 };

export interface ReactionProps extends ReactionOption {
  size?: GlyphSize;
  /**
   * When the gesture plays: `hover` (core's name; here, on press) once per
   * press, `loop` every few seconds, `manual` only when `playKey` changes.
   */
  trigger?: "hover" | "loop" | "manual";
  /** Change it (a counter works) to play the gesture again. */
  playKey?: number | string;
  /** Hidden from screen readers, when a control around it already names it. */
  decorative?: boolean;
  /** Draws the reaction instead of the emoji or `src`, such as a Lottie view. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** The emoji or image, at `size` points. */
function Glyph({ option, size }: { option: ReactionOption; size: number }) {
  if (option.src) {
    return (
      <Image
        source={{ uri: option.src }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessible={false}
      />
    );
  }
  return (
    <RNText
      allowFontScaling={false}
      style={{ fontSize: size * 0.9, lineHeight: size, textAlign: "center", width: size }}
    >
      {option.emoji ?? option.value}
    </RNText>
  );
}

/** A gesture's transform, driven by one value from 0 to 1, for a glyph `size` across. */
function gestureStyle(kind: ReactionMotion, progress: Animated.Value, size: number) {
  if (kind === "none") return undefined;
  const gesture = REACTION_GESTURES[kind];
  const track = (key: Parameters<typeof gestureTrack>[1], unit = 1) => {
    const { inputRange, outputRange } = gestureTrack(gesture, key);
    return progress.interpolate({ inputRange, outputRange: outputRange.map((v) => v * unit) });
  };
  const degrees = (key: "rotate" | "skewX") => {
    const { inputRange, outputRange } = gestureTrack(gesture, key);
    return progress.interpolate({ inputRange, outputRange: outputRange.map((v) => `${v}deg`) });
  };
  return {
    transformOrigin: `${gesture.origin[0] * 100}% ${gesture.origin[1] * 100}%`,
    transform: [
      { translateX: track("translateX", size) },
      { translateY: track("translateY", size) },
      { rotate: degrees("rotate") },
      { skewX: degrees("skewX") },
      { scaleX: track("scaleX") },
      { scaleY: track("scaleY") },
    ],
  };
}

/**
 * Core's `Reaction`: one reaction at a fixed size with its own gesture. A
 * heart beats, a thumbs-up nods, a laugh shakes, fire flickers. Give it `src`
 * for an image of your own and `motion` to choose its gesture. With reduce
 * motion on it holds still.
 */
export const Reaction: RefComponent<ReactionProps, ViewRef> = forwardRef<ViewRef, ReactionProps>(
  function Reaction(
    {
      value,
      emoji,
      src,
      label,
      motion,
      size = "m",
      trigger = "hover",
      playKey,
      decorative = false,
      children,
      style,
    },
    ref,
  ) {
    const theme = useTheme();
    const reduce = useReduceMotion();
    const option = { value, emoji, src, label, motion };
    const kind = reduce ? "none" : reactionMotion(option);
    const points = GLYPH_REM[size] * theme.rem;
    const progress = useRef(new Animated.Value(0)).current;
    const running = useRef<Animated.CompositeAnimation | null>(null);

    const play = () => {
      if (kind === "none") return;
      running.current?.stop();
      progress.setValue(0);
      running.current = Animated.timing(progress, {
        toValue: 1,
        duration: REACTION_GESTURES[kind].duration,
        easing: Easing.bezier(0.3, 0.7, 0.4, 1),
        useNativeDriver: true,
      });
      running.current.start();
    };

    const mounted = useRef(false);
    // biome-ignore lint/correctness/useExhaustiveDependencies: replays on a new key only
    useEffect(() => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (playKey !== undefined) play();
    }, [playKey]);

    useEffect(() => {
      if (trigger !== "loop" || kind === "none") return;
      const gesture = REACTION_GESTURES[kind];
      progress.setValue(0);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(progress, {
            toValue: 1,
            duration: gesture.duration,
            easing: Easing.bezier(0.3, 0.7, 0.4, 1),
            useNativeDriver: true,
          }),
          Animated.delay(2600 - gesture.duration),
          Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }, [trigger, kind, progress]);

    useEffect(() => () => running.current?.stop(), []);

    const body = (
      <Animated.View
        style={[{ width: points, height: points }, gestureStyle(kind, progress, points)]}
      >
        {children ?? <Glyph option={option} size={points} />}
      </Animated.View>
    );

    const a11y = decorative
      ? {
          accessibilityElementsHidden: true,
          importantForAccessibility: "no-hide-descendants" as const,
        }
      : {
          accessible: true,
          accessibilityRole: "image" as const,
          accessibilityLabel: reactionLabel(option),
        };

    if (trigger === "hover") {
      return (
        <Pressable ref={ref} onPressIn={play} style={style} {...a11y}>
          {body}
        </Pressable>
      );
    }
    return (
      <View ref={ref} style={style} {...a11y}>
        {body}
      </View>
    );
  },
);

type ReactionValue = string | string[] | null;

export interface ReactionChange {
  /** The reaction that was picked or taken back. */
  option: ReactionOption;
  /** `true` when it was added, `false` when it was taken back. */
  selected: boolean;
}

export interface ReactionsProps extends Omit<FlexProps, "children"> {
  /** The reactions people can pick, in the order the picker shows them. */
  options: ReactionOption[];
  /** How many people reacted with each, by `value`, counting the viewer's own. Leave it out for no numbers. */
  counts?: Record<string, number>;
  /** The viewer's reaction: one value (or `null`), or a list with `multiple`. */
  value?: ReactionValue;
  defaultValue?: ReactionValue;
  /** Called with the next value, and which reaction changed. */
  onValueChange?: (value: ReactionValue, change: ReactionChange) => void;
  /** Let a person leave several reactions instead of one. */
  multiple?: boolean;
  /** A chip for every option, even at zero. Off shows only the ones in use. */
  showAll?: boolean;
  /** The add button that opens every option. */
  picker?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** What flies out of a chip when someone picks it. */
  effect?: "burst" | "float" | "none";
  size?: "s" | "m" | "l";
  disabled?: boolean;
  /** Draw a reaction yourself, such as with Lottie. The emoji or `src` otherwise. */
  renderGlyph?: (option: ReactionOption) => ReactNode;
  /** The add button's name. */
  addLabel?: string;
  /** The group's name. */
  ariaLabel?: string;
}

// Social.module.scss: chip height and side padding per size, in rem.
const CHIP = {
  s: { height: 1.5, padding: 0.375, text: "label-default-xs" },
  m: { height: 2, padding: 0.5, text: "label-default-s" },
  l: { height: 2.5, padding: 0.75, text: "label-default-m" },
} as const;
const PICKER_GLYPH = { s: "l", m: "l", l: "xl" } as const;
const EFFECT_MS = { burst: 800, float: 1150 } as const;

const toList = (value: ReactionValue | undefined) =>
  value === undefined || value === null ? [] : Array.isArray(value) ? value : [value];

const countsKey = (counts?: Record<string, number>) =>
  counts
    ? Object.keys(counts)
        .sort()
        .map((key) => `${key}:${counts[key]}`)
        .join("|")
    : "";

/** A number that rises into place when it changes, as core's CountFx wheel. */
function RollingCount({
  value,
  variant,
  color,
}: {
  value: number;
  variant: string;
  color: string;
}) {
  const reduce = useReduceMotion();
  const enter = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on a new value
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce) return;
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [value, reduce, enter]);
  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
      }}
    >
      <Text variant={variant as "label-default-s"} style={{ color, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </Animated.View>
  );
}

/** Copies of the reaction that fly out of a chip and fade, then call `onDone`. */
function Effect({
  kind,
  glyph,
  size,
  left,
  onDone,
}: {
  kind: "burst" | "float";
  glyph: ReactNode;
  size: number;
  left: number;
  onDone: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per effect
  useEffect(() => {
    const run = Animated.timing(progress, {
      toValue: 1,
      duration: EFFECT_MS[kind] - 50,
      easing: Easing.bezier(0.15, 0.8, 0.3, 1),
      useNativeDriver: true,
    });
    run.start(({ finished }) => finished && onDone());
    return () => run.stop();
  }, []);

  const particle = kind === "burst" ? size : size * 1.4;
  const angles = kind === "burst" ? BURST_ANGLES : [0];
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", left, top: "50%", width: 0, height: 0, zIndex: 1 }}
    >
      {angles.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const distance = kind === "burst" ? size * 2.4 : size * 3.2 * 1.4;
        const style =
          kind === "burst"
            ? {
                opacity: progress.interpolate({
                  inputRange: [0, 0.12, 0.65, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.sin(rad) * distance],
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -Math.cos(rad) * distance],
                    }),
                  },
                  { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }) },
                ],
              }
            : {
                opacity: progress.interpolate({
                  inputRange: [0, 0.15, 0.7, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, -particle * 0.12, particle * 0.1],
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 0.15, 0.5, 1],
                      outputRange: [0, -particle * 0.3, -particle * 1.6, -distance],
                    }),
                  },
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 0.15, 1],
                      outputRange: [0.6, 1.1, 0.9],
                    }),
                  },
                ],
              };
        return (
          <Animated.View
            key={angle}
            style={[
              {
                position: "absolute",
                left: -particle / 2,
                top: -particle / 2,
                width: particle,
                height: particle,
                alignItems: "center",
                justifyContent: "center",
              },
              style,
            ]}
          >
            {glyph}
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * Core's `Reactions`: the row under a post, a comment or a message. Each chip
 * shows a reaction and how many people left it; pressing one adds or takes
 * back yours, with the reaction's own gesture and a small burst. The add
 * button opens every option. One reaction per person by default; `multiple`
 * allows several. The counts follow the viewer's pick at once and settle on
 * the next `counts` without counting them twice.
 */
export const Reactions: RefComponent<ReactionsProps, ViewRef> = forwardRef<ViewRef, ReactionsProps>(
  function Reactions(
    {
      options,
      counts,
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      showAll = false,
      picker = true,
      open,
      defaultOpen = false,
      onOpenChange,
      effect = "burst",
      size = "m",
      disabled = false,
      renderGlyph,
      addLabel = "Add reaction",
      ariaLabel = "Reactions",
      ...flex
    },
    ref,
  ) {
    const theme = useTheme();
    const reduce = useReduceMotion();
    const [ownValue, setOwnValue] = useState<ReactionValue>(defaultValue ?? (multiple ? [] : null));
    const current = value !== undefined ? value : ownValue;
    const selected = toList(current);

    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const isOpen = open ?? ownOpen;
    const setOpen = (next: boolean) => {
      if (open === undefined) setOwnOpen(next);
      onOpenChange?.(next);
    };

    const key = countsKey(counts);
    const [snapshot, setSnapshot] = useState({ key, selected });
    if (snapshot.key !== key) setSnapshot({ key, selected });
    const countOf = (v: string) =>
      Math.max(
        0,
        (counts?.[v] ?? 0) -
          (snapshot.selected.includes(v) ? 1 : 0) +
          (selected.includes(v) ? 1 : 0),
      );

    const [plays, setPlays] = useState<Record<string, number>>({});
    const [effects, setEffects] = useState<Record<string, number>>({});
    const effectRun = useRef(0);

    const toggle = (option: ReactionOption) => {
      if (disabled) return;
      const on = !selected.includes(option.value);
      const nextList = on
        ? multiple
          ? [...selected, option.value]
          : [option.value]
        : selected.filter((v) => v !== option.value);
      const next: ReactionValue = multiple ? nextList : (nextList[0] ?? null);
      if (value === undefined) setOwnValue(next);
      setPlays((all) => ({ ...all, [option.value]: (all[option.value] ?? 0) + 1 }));
      if (on && effect !== "none" && !reduce) {
        effectRun.current += 1;
        const id = effectRun.current;
        setEffects((all) => ({ ...all, [option.value]: id }));
      }
      onValueChange?.(next, { option, selected: on });
    };

    const known = new Set(options.map((option) => option.value));
    const retired = Object.keys(counts ?? {})
      .filter((v) => !known.has(v) && countOf(v) > 0)
      .map((v): ReactionOption => ({ value: v }));
    const chips = [...options, ...retired].filter(
      (option) => showAll || countOf(option.value) > 0 || selected.includes(option.value),
    );

    const chip = CHIP[size];
    const height = chip.height * theme.rem;
    const padding = chip.padding * theme.rem;
    const glyph = GLYPH_REM[size] * theme.rem;

    return (
      <Row ref={ref} gap="4" wrap vertical="center" role="group" aria-label={ariaLabel} {...flex}>
        {chips.map((option) => {
          const on = selected.includes(option.value);
          const count = countOf(option.value);
          const label = reactionLabel(option);
          const color = theme.color(
            on ? "brand-on-background-strong" : "neutral-on-background-medium",
          );
          const effectId = effects[option.value];
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={counts ? `${label}, ${count}` : label}
              accessibilityState={{ selected: on, disabled }}
              aria-pressed={on}
              disabled={disabled}
              hitSlop={touchSlop(theme, height, Number.POSITIVE_INFINITY)}
              onPress={() => toggle(option)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: theme.space("4"),
                height,
                paddingHorizontal: padding,
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: theme.color(on ? "brand-border-medium" : "neutral-alpha-weak"),
                backgroundColor: theme.color(
                  on
                    ? pressed
                      ? "brand-alpha-medium"
                      : "brand-alpha-weak"
                    : pressed
                      ? "neutral-alpha-medium"
                      : "neutral-alpha-weak",
                ),
                opacity: disabled ? 0.5 : 1,
                transform: [{ scale: pressed && !reduce ? 0.94 : 1 }],
              })}
            >
              <Reaction
                {...option}
                size={size}
                trigger="manual"
                playKey={plays[option.value]}
                decorative
              >
                {renderGlyph?.(option)}
              </Reaction>
              {counts && <RollingCount value={count} variant={chip.text} color={color} />}
              {effectId !== undefined && effect !== "none" && (
                <Effect
                  key={effectId}
                  kind={effect}
                  size={glyph}
                  left={padding + glyph / 2}
                  glyph={renderGlyph?.(option) ?? <Glyph option={option} size={glyph * 0.8} />}
                  onDone={() =>
                    setEffects((all) => {
                      if (all[option.value] !== effectId) return all;
                      const { [option.value]: _done, ...rest } = all;
                      return rest;
                    })
                  }
                />
              )}
            </Pressable>
          );
        })}
        {picker && options.length > 0 && (
          <DropdownWrapper
            open={isOpen}
            onOpenChange={setOpen}
            placement="top-start"
            trigger={
              <IconButton
                icon="smiley"
                size={size}
                rounded
                variant="secondary"
                ariaLabel={addLabel}
                disabled={disabled}
              />
            }
            dropdown={
              <Row gap="2" padding="4" role="group" aria-label={addLabel}>
                {options.map((option) => {
                  const on = selected.includes(option.value);
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityLabel={reactionLabel(option)}
                      accessibilityState={{ selected: on }}
                      aria-pressed={on}
                      onPress={() => {
                        // Picking the one you already left keeps it: the picker adds.
                        if (!on) toggle(option);
                        setOpen(false);
                      }}
                      style={({ pressed }) => ({
                        width: 2.75 * theme.rem,
                        height: 2.75 * theme.rem,
                        borderRadius: 9999,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: on
                          ? theme.color("brand-alpha-weak")
                          : pressed
                            ? theme.color("neutral-alpha-weak")
                            : "transparent",
                        transform: [{ scale: pressed && !reduce ? 1.15 : 1 }],
                      })}
                    >
                      <Reaction {...option} size={PICKER_GLYPH[size]} trigger="manual" decorative>
                        {renderGlyph?.(option)}
                      </Reaction>
                    </Pressable>
                  );
                })}
              </Row>
            }
          />
        )}
      </Row>
    );
  },
);
