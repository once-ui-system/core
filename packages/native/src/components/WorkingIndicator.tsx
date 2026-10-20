import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { mixColors } from "../theme/colorScheme";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, Row } from "./Flex";
import { LogoSpinner } from "./LogoSpinner";
import { useFrameTime, useReduceMotion } from "./motion";
import { Text } from "./Text";
import { workingVerbs } from "./workingVerbs";

export interface WorkingIndicatorProps extends Omit<FlexProps, "children"> {
  /** The words to cycle through. Defaults to `workingVerbs`. */
  verbs?: readonly string[];
  /** A fixed line instead of the cycling verbs, such as "Searching the docs". */
  label?: ReactNode;
  /** Milliseconds each verb stays. */
  interval?: number;
  /** Visit the verbs in a random order (never the same one twice in a row). Off walks the list in order. */
  shuffle?: boolean;
  /** A light sweep across the words, as on a loading line. Off with reduce motion. */
  shimmer?: boolean;
  /** Show seconds since `startedAt`, or since the indicator appeared. */
  showElapsed?: boolean;
  /** When the work began, so the count survives a remount. A `Date` or epoch milliseconds. */
  startedAt?: Date | number;
  /** Quiet text after the verb, such as "tap to stop". */
  detail?: ReactNode;
  /** The loader before the words. `LogoSpinner` by default; `false` for none. */
  loader?: ReactNode | false;
  size?: "s" | "m" | "l";
  /** What screen readers announce. The cycling words are not read out. */
  "aria-label"?: string;
}

const TEXT_VARIANT = {
  s: "body-default-xs",
  m: "body-default-s",
  l: "body-default-m",
} as const;

const LOADER_SIZE = { s: "xs", m: "s", l: "m" } as const;

/** Seconds as "8s" or "1m 05s". */
const formatElapsed = (seconds: number) =>
  seconds < 60
    ? `${seconds}s`
    : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;

/**
 * How bright each of `count` letters is under the sweep, 0 to 1, at `time`.
 * Core paints a 250%-wide gradient through the letters and slides it across in
 * 2.4s; React Native can't clip a gradient to text, so each letter takes the
 * color the gradient would give it.
 */
export function shimmerLevels(count: number, time: number) {
  const p = 1 - ((time / 2.4) % 1);
  const peak = 1.25 - 1.5 * p;
  return Array.from({ length: count }, (_, i) => {
    const f = (i + 0.5) / Math.max(count, 1);
    return Math.max(0, 1 - Math.abs(f - peak) / 0.375);
  });
}

function Shimmer({
  text,
  variant,
}: {
  text: string;
  variant: (typeof TEXT_VARIANT)[keyof typeof TEXT_VARIANT];
}) {
  const theme = useTheme();
  const time = useFrameTime(true);
  const weak = theme.color("neutral-on-background-weak");
  const strong = theme.color("neutral-on-background-strong");
  const letters = Array.from(text);
  const levels = shimmerLevels(letters.length, time);
  return (
    <Text textVariant={variant} truncate onBackground="neutral-weak">
      {letters.map((letter, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: letters of one fixed string
        <Text key={i} textVariant={variant} style={{ color: mixColors(strong, weak, levels[i]) }}>
          {letter}
        </Text>
      ))}
    </Text>
  );
}

/** Each new verb rises into place, as core's `working-verb-in`. */
function Enter({ children, still }: { children: ReactNode; still: boolean }) {
  const progress = useRef(new Animated.Value(still ? 1 : 0)).current;
  useEffect(() => {
    if (still) return;
    const run = Animated.timing(progress, { toValue: 1, duration: 320, useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [progress, still]);
  return (
    <Animated.View
      style={{
        flexShrink: 1,
        minWidth: 0,
        opacity: progress,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Core's `WorkingIndicator`: says an assistant is working, with the moving
 * mark and a playful verb that changes every few seconds: "Imagining…",
 * "Noodling…", "Kerning…".
 *
 * The whole row is one accessible element with a fixed label, so a screen
 * reader hears "Working" instead of every new verb.
 */
export function WorkingIndicator({
  verbs = workingVerbs,
  label,
  interval = 2800,
  shuffle = true,
  shimmer = true,
  showElapsed = false,
  startedAt,
  detail,
  loader,
  size = "m",
  "aria-label": ariaLabel = "Working",
  ...flex
}: WorkingIndicatorProps) {
  const reduceMotion = useReduceMotion();
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const cycling = label === undefined && verbs.length > 1;

  useEffect(() => {
    if (!cycling) return;
    const next = (current: number) => {
      if (!shuffle) return (current + 1) % verbs.length;
      // Any index but the current one, uniformly.
      const step = 1 + Math.floor(Math.random() * (verbs.length - 1));
      return (current + step) % verbs.length;
    };
    if (shuffle) setIndex((current) => next(current));
    const id = setInterval(() => setIndex(next), interval);
    return () => clearInterval(id);
  }, [cycling, interval, shuffle, verbs.length]);

  const start = startedAt === undefined ? undefined : new Date(startedAt).getTime();

  useEffect(() => {
    if (!showElapsed) return;
    const from = start ?? Date.now();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - from) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [showElapsed, start]);

  const variant = TEXT_VARIANT[size];
  const verb = verbs[index % Math.max(verbs.length, 1)] ?? "";
  const line = label ?? (verb ? `${verb}…` : null);
  const quiet = [showElapsed ? formatElapsed(elapsed) : null, detail].filter(
    (part) => part !== null && part !== undefined && part !== false,
  );

  return (
    <Row
      gap="8"
      vertical="center"
      minWidth={0}
      accessible
      accessibilityLabel={ariaLabel}
      accessibilityLiveRegion="polite"
      {...flex}
    >
      {loader === undefined ? (
        <LogoSpinner size={LOADER_SIZE[size]} aria-label="" />
      ) : (
        loader || null
      )}
      <Row gap="8" vertical="center" minWidth={0} flex={1}>
        <Enter key={cycling ? index : undefined} still={!cycling || reduceMotion}>
          {typeof line === "string" && shimmer && !reduceMotion ? (
            <Shimmer text={line} variant={variant} />
          ) : (
            <Text textVariant={variant} onBackground="neutral-medium" truncate>
              {line}
            </Text>
          )}
        </Enter>
        {quiet.length > 0 && (
          <View style={{ flexShrink: 0 }}>
            <Text textVariant={variant} onBackground="neutral-weak" numberOfLines={1}>
              {quiet.map((part, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: at most two fixed slots
                <Fragment key={i}>
                  {i > 0 && " · "}
                  {part}
                </Fragment>
              ))}
            </Text>
          </View>
        )}
      </Row>
    </Row>
  );
}
