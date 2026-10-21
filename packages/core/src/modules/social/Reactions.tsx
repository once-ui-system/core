"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, type ReactNode, useEffect, useRef, useState } from "react";
import { CountFx } from "../../components/CountFx";
import { DropdownWrapper } from "../../components/DropdownWrapper";
import { IconButton } from "../../components/IconButton";
import { Row } from "../../components/Row";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Reaction, ReactionGlyph } from "./Reaction";
import { BURST_ANGLES, type ReactionOption, reactionLabel } from "./reactionMotion";
import styles from "./Social.module.scss";

type ReactionValue = string | string[] | null;

export interface ReactionChange {
  /** The reaction that was picked or taken back. */
  option: ReactionOption;
  /** `true` when it was added, `false` when it was taken back. */
  selected: boolean;
}

export interface ReactionsProps
  extends Omit<React.ComponentProps<typeof Row>, "children" | "defaultValue" | "onChange"> {
  /** The reactions people can pick, in the order the picker shows them. */
  options: ReactionOption[];
  /**
   * How many people reacted with each, by `value`, counting the viewer's own
   * reaction as `value` has it. Leave it out to show no numbers.
   */
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

const GLYPH = { s: "s", m: "m", l: "l" } as const;
const PICKER_GLYPH = { s: "l", m: "l", l: "xl" } as const;
const COUNT_TEXT = { s: "label-default-xs", m: "label-default-s", l: "label-default-m" } as const;
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

/**
 * A row of reactions under a post, a comment or a message. Each chip shows a
 * reaction and how many people left it; tapping one adds or takes back yours,
 * with the reaction's own gesture and a small burst. The add button opens
 * every option. Reactions can be emoji or the app's own images.
 *
 * One reaction per person by default, as on most feeds; `multiple` allows
 * several, as in chat. Controlled by `value`, or uncontrolled from
 * `defaultValue`; either way the counts follow the viewer's pick right away,
 * and settle on what `counts` says when the server answers.
 */
const Reactions = forwardRef<HTMLDivElement, ReactionsProps>(
  (
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
      className,
      ...flex
    },
    ref,
  ) => {
    const [ownValue, setOwnValue] = useState<ReactionValue>(defaultValue ?? (multiple ? [] : null));
    const current = value !== undefined ? value : ownValue;
    const selected = toList(current);

    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const isOpen = open ?? ownOpen;
    const setOpen = (next: boolean) => {
      if (open === undefined) setOwnOpen(next);
      onOpenChange?.(next);
    };

    // `counts` already includes the viewer's reaction as it stood when they
    // were given. Until new counts arrive, a pick moves its number by one.
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

    const { shouldAnimate } = useReducedMotion();
    const [plays, setPlays] = useState<Record<string, number>>({});
    const [effects, setEffects] = useState<Record<string, number>>({});
    const effectRun = useRef(0);
    const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
    useEffect(() => {
      const pending = timers.current;
      return () => {
        for (const id of pending) clearTimeout(id);
      };
    }, []);

    const replay = (v: string) => setPlays((all) => ({ ...all, [v]: (all[v] ?? 0) + 1 }));

    const celebrate = (v: string) => {
      if (effect === "none" || !shouldAnimate) return;
      effectRun.current += 1;
      const id = effectRun.current;
      setEffects((all) => ({ ...all, [v]: id }));
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        setEffects((all) => {
          if (all[v] !== id) return all;
          const { [v]: _done, ...rest } = all;
          return rest;
        });
      }, EFFECT_MS[effect]);
      timers.current.add(timer);
    };

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
      replay(option.value);
      if (on) celebrate(option.value);
      onValueChange?.(next, { option, selected: on });
    };

    // Options in use first, then any counted value the options no longer list
    // (a reaction the app has since retired), so no one's reaction vanishes.
    const known = new Set(options.map((option) => option.value));
    const retired = Object.keys(counts ?? {})
      .filter((v) => !known.has(v) && countOf(v) > 0)
      .map((v): ReactionOption => ({ value: v }));
    const chips = [...options, ...retired].filter(
      (option) => showAll || countOf(option.value) > 0 || selected.includes(option.value),
    );

    const glyphOf = (option: ReactionOption) =>
      renderGlyph ? renderGlyph(option) : <ReactionGlyph option={option} />;

    const pickerRef = useRef<HTMLDivElement>(null);
    const moveFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(pickerRef.current?.querySelectorAll("button") ?? []);
      const at = items.indexOf(document.activeElement as HTMLButtonElement);
      const to =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (at + 1) % items.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (at - 1 + items.length) % items.length
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : -1;
      if (to < 0) return;
      event.preventDefault();
      items[to]?.focus();
    };

    return (
      <Row
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        gap="4"
        wrap
        vertical="center"
        className={classNames(styles[`chips-${size}`], className)}
        {...flex}
      >
        {chips.map((option) => {
          const on = selected.includes(option.value);
          const count = countOf(option.value);
          const label = reactionLabel(option);
          return (
            <button
              key={option.value}
              type="button"
              className={classNames(styles.chip, styles[GLYPH[size]])}
              aria-pressed={on}
              aria-label={counts ? `${label}, ${count}` : label}
              disabled={disabled}
              onClick={() => toggle(option)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") replay(option.value);
              }}
            >
              <Reaction
                {...option}
                size={GLYPH[size]}
                trigger="manual"
                playKey={plays[option.value]}
                decorative
              >
                {renderGlyph?.(option)}
              </Reaction>
              {counts && (
                <CountFx
                  aria-hidden
                  className={styles.count}
                  variant={COUNT_TEXT[size]}
                  value={count}
                  effect="wheel"
                  speed={300}
                />
              )}
              {effects[option.value] !== undefined && effect !== "none" && (
                <span
                  key={effects[option.value]}
                  className={classNames(styles.effect, styles[effect])}
                  aria-hidden
                >
                  {(effect === "burst" ? BURST_ANGLES : [0]).map((angle) => (
                    <span
                      key={angle}
                      className={styles.particle}
                      style={{ "--angle": `${angle}deg` } as React.CSSProperties}
                    >
                      {glyphOf(option)}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
        {picker && options.length > 0 && (
          <DropdownWrapper
            open={isOpen}
            onOpenChange={setOpen}
            handleArrowNavigation={false}
            placement="top-start"
            trigger={
              <IconButton
                icon="smiley"
                size={size}
                rounded
                variant="secondary"
                className={styles.add}
                ariaLabel={addLabel}
                tooltip={chips.length === 0 ? undefined : addLabel}
                disabled={disabled}
              />
            }
            dropdown={
              <Row
                ref={pickerRef}
                role="group"
                aria-label={addLabel}
                className={styles.picker}
                onKeyDown={moveFocus}
              >
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected.includes(option.value)}
                    aria-label={reactionLabel(option)}
                    title={reactionLabel(option)}
                    className={classNames(styles.option, styles[PICKER_GLYPH[size]])}
                    onClick={() => {
                      // Picking the one you already left keeps it: the picker adds.
                      if (!selected.includes(option.value)) toggle(option);
                      setOpen(false);
                    }}
                  >
                    <Reaction {...option} size={PICKER_GLYPH[size]} trigger="hover" decorative>
                      {renderGlyph?.(option)}
                    </Reaction>
                  </button>
                ))}
              </Row>
            }
          />
        )}
      </Row>
    );
  },
);

Reactions.displayName = "Reactions";

export { Reactions };
