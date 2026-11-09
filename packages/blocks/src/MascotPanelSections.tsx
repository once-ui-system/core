"use client";

import {
  Button,
  ColorInput,
  Column,
  Flex,
  MASCOT_ACCESSORIES,
  MASCOT_DESIGN_DEFAULTS,
  MASCOT_DESIGN_RANGES,
  Mascot,
  type MascotAccessory,
  type MascotDesign,
  type MascotMood,
  type MascotState,
  mascotDesignProps,
  mascotLook,
  parseMascotDesign,
  Slider,
  Switch,
  ToggleButton,
} from "@once-ui-system/core";
import classNames from "clsx";
import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { mergeLabels } from "./internal/labels.js";
import {
  designJson,
  designJsx,
  download,
  standaloneSvg,
  svgToPng,
} from "./internal/mascotExport.js";
import { radioGroupKeyDown } from "./internal/radioKeys.js";
import styles from "./MascotPanel.module.scss";
import swatchStyles from "./StylePanel.module.scss";
import {
  StylePanelGroup as Group,
  StylePanelOptions as Options,
  StylePanelRow as Row,
  type StyleGroupProps,
  StylePanelStackedContext,
  type StyleRowProps,
  useGroupName,
} from "./StylePanelSections.js";

/* ---- labels -------------------------------------------------------------- */

type GroupKey = "preview" | "body" | "eyes" | "face" | "accessories" | "working" | "motion";
type EyeShape = "tile" | "pill" | "round" | "wide" | "dot";
type Scheme = "brand" | "accent" | "neutral";

/** A group's heading. */
export interface MascotPanelHeading {
  title?: string;
  description?: string;
}

/** Every string MascotPanel shows or announces. Omitted ones keep the English default. */
export interface MascotPanelLabels {
  groups?: Partial<Record<GroupKey, MascotPanelHeading>>;
  rows?: Partial<
    Record<
      | "color"
      | "roundness"
      | "aspect"
      | "surface"
      | "eyes"
      | "eyeSize"
      | "eyeSpacing"
      | "eyeHeight"
      | "eyeColor"
      | "mouth"
      | "brows"
      | "cheeks"
      | "accessories"
      | "accessoryColor"
      | "working"
      | "sides"
      | "face"
      | "personality"
      | "state"
      | "mood",
      string
    >
  >;
  options?: {
    colors?: Partial<Record<Scheme | "custom", string>>;
    surface?: Partial<Record<NonNullable<MascotDesign["surface"]>, string>>;
    eyes?: Partial<Record<EyeShape, string>>;
    mouth?: Partial<Record<NonNullable<MascotDesign["mouth"]>, string>>;
    personality?: Partial<Record<NonNullable<MascotDesign["personality"]>, string>>;
    working?: Partial<Record<"none" | "cube" | "d20", string>>;
    sides?: Partial<Record<"classic" | "tints" | "mono", string>>;
    face?: Partial<Record<"3d" | "flat", string>>;
    state?: Partial<Record<MascotState, string>>;
    mood?: Partial<Record<MascotMood, string>>;
    accessories?: Partial<Record<MascotAccessory, string>>;
  };
  actions?: Partial<
    Record<
      "randomize" | "reset" | "copyJson" | "copyJsx" | "copied" | "downloadSvg" | "downloadPng",
      string
    >
  >;
  /** What screen readers hear for the preview. */
  preview?: string;
  /** The colour swatches' names: `(name) => string`. */
  colorSwatch?: (name: string) => string;
}

type Complete<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends (...args: never[]) => unknown
    ? NonNullable<T[K]>
    : NonNullable<T[K]> extends object
      ? Complete<NonNullable<T[K]>>
      : NonNullable<T[K]>;
};
type ResolvedLabels = Complete<MascotPanelLabels>;

const MOODS: MascotMood[] = [
  "neutral",
  "happy",
  "surprised",
  "sad",
  "skeptical",
  "wink",
  "focused",
  "determined",
  "love",
  "excited",
  "laughing",
  "embarrassed",
  "crying",
  "angry",
  "confused",
];
const STATES: MascotState[] = ["idle", "listening", "thinking", "speaking", "sleeping"];

const capital = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
const named = <K extends string>(keys: readonly K[], names: Partial<Record<K, string>> = {}) =>
  Object.fromEntries(keys.map((key) => [key, names[key] ?? capital(key)])) as Record<K, string>;

const DEFAULT_LABELS: ResolvedLabels = {
  groups: {
    preview: { title: "Preview", description: "Try its states and moods; none of this is saved" },
    body: { title: "Body", description: "Color, shape and surface" },
    eyes: { title: "Eyes", description: "Shape, size and placement" },
    face: { title: "Face", description: "Mouth, brows and cheeks" },
    accessories: { title: "Accessories", description: "What it wears" },
    working: { title: "Working", description: "What it turns into while it thinks" },
    motion: { title: "Motion", description: "How it moves" },
  },
  rows: {
    color: "Color",
    roundness: "Roundness",
    aspect: "Width",
    surface: "Surface",
    eyes: "Eyes",
    eyeSize: "Size",
    eyeSpacing: "Spacing",
    eyeHeight: "Height",
    eyeColor: "Eye color",
    mouth: "Mouth",
    brows: "Brows",
    cheeks: "Cheeks",
    accessories: "Wears",
    accessoryColor: "One color",
    working: "Style",
    sides: "Sides",
    face: "Face",
    personality: "Personality",
    state: "State",
    mood: "Mood",
  },
  options: {
    colors: named(["brand", "accent", "neutral", "custom"] as const),
    surface: named(["glossy", "matte", "flat", "glass"] as const),
    eyes: named(["tile", "pill", "round", "wide", "dot"] as const),
    mouth: named(["none", "smile", "dot", "line"] as const),
    personality: named(["calm", "default", "bouncy"] as const),
    working: named(["none", "cube", "d20"] as const, { d20: "D20" }),
    sides: named(["classic", "tints", "mono"] as const),
    face: named(["3d", "flat"] as const, { "3d": "3D" }),
    state: named(STATES),
    mood: named(MOODS),
    accessories: named(MASCOT_ACCESSORIES, {
      catEars: "Cat ears",
      partyHat: "Party hat",
    }),
  },
  actions: {
    randomize: "Randomize",
    reset: "Reset",
    copyJson: "Copy JSON",
    copyJsx: "Copy JSX",
    copied: "Copied",
    downloadSvg: "SVG",
    downloadPng: "PNG",
  },
  preview: "Mascot preview",
  colorSwatch: (name) => `Body color: ${name}`,
};

const MascotPanelLabelsContext = createContext<ResolvedLabels>(DEFAULT_LABELS);
const useLabels = () => useContext(MascotPanelLabelsContext);

/* ---- state --------------------------------------------------------------- */

export interface MascotPanelContextValue {
  /** The design being edited. */
  value: MascotDesign;
  /** Changes some of it. */
  set: (patch: Partial<Omit<MascotDesign, "v">>) => void;
  /** Swaps in a whole design (Randomize, Reset, an import). */
  replace: (next: MascotDesign) => void;
  /** The preview's state and mood: tried, never saved. */
  trial: { state: MascotState; mood: MascotMood };
  setTrial: (next: Partial<{ state: MascotState; mood: MascotMood }>) => void;
}

const MascotPanelContext = createContext<MascotPanelContextValue | null>(null);

/** The panel's state, for a custom row inside a MascotPanelRoot. */
export function useMascotPanel(): MascotPanelContextValue {
  const context = useContext(MascotPanelContext);
  if (!context) {
    throw new Error(
      "MascotPanel sections must be rendered inside a <MascotPanel> or <MascotPanelRoot>",
    );
  }
  return context;
}

/** The design with defaults filled in, for showing the controls. */
const shown = (value: MascotDesign) => ({ ...MASCOT_DESIGN_DEFAULTS, ...value });

function readStored(key: string | undefined): MascotDesign | undefined {
  if (!key) return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? parseMascotDesign(raw) : undefined;
  } catch {
    return undefined;
  }
}

export interface MascotPanelRootProps
  extends Omit<React.ComponentProps<typeof Column>, "value" | "onChange" | "defaultValue"> {
  /** The design, controlled. Pair with `onValueChange`. */
  value?: MascotDesign;
  /** The starting design when uncontrolled. */
  defaultValue?: MascotDesign;
  /** Called with the whole next design and the part that changed. */
  onValueChange?: (next: MascotDesign, changed: Partial<MascotDesign>) => void;
  /** Uncontrolled only: remember the design in the browser under this key. */
  storageKey?: string;
  /** Every string the panel shows or announces, over the English defaults. */
  labels?: MascotPanelLabels;
  /** Put each row's label above its control, for a narrow sidebar. */
  stacked?: boolean;
}

const Root = function Root({
  ref,
  value,
  defaultValue,
  onValueChange,
  storageKey,
  labels,
  stacked = false,
  children,
  ...rest
}: MascotPanelRootProps) {
  const controlled = value !== undefined;
  const [own, setOwn] = useState<MascotDesign>(() => defaultValue ?? { v: 1 });
  const [trial, setTrialState] = useState<{ state: MascotState; mood: MascotMood }>({
    state: "idle",
    mood: "neutral",
  });

  // A stored design is read after hydration, so the server render matches.
  useEffect(() => {
    if (controlled) return;
    const stored = readStored(storageKey);
    if (stored) setOwn(stored);
  }, [controlled, storageKey]);

  const current = controlled ? value : own;

  const commit = useCallback(
    (next: MascotDesign, changed: Partial<MascotDesign>) => {
      for (const key of Object.keys(next) as (keyof MascotDesign)[]) {
        if (next[key] === undefined) delete next[key];
      }
      if (!controlled) {
        setOwn(next);
        if (storageKey) {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // Private mode or a full quota: the design still works for this visit.
          }
        }
      }
      onValueChange?.(next, changed);
    },
    [controlled, storageKey, onValueChange],
  );

  const context = useMemo<MascotPanelContextValue>(
    () => ({
      value: current,
      set: (patch) => commit({ ...current, ...patch, v: 1 }, patch),
      replace: (next) => commit({ ...next, v: 1 }, next),
      trial,
      setTrial: (next) => setTrialState((was) => ({ ...was, ...next })),
    }),
    [current, commit, trial],
  );

  const resolvedLabels = useMemo(() => mergeLabels(DEFAULT_LABELS, labels), [labels]);

  return (
    <MascotPanelContext.Provider value={context}>
      <MascotPanelLabelsContext.Provider value={resolvedLabels}>
        <StylePanelStackedContext.Provider value={stacked}>
          <Column fillWidth gap="16" ref={ref} {...rest}>
            {children}
          </Column>
        </StylePanelStackedContext.Provider>
      </MascotPanelLabelsContext.Provider>
    </MascotPanelContext.Provider>
  );
};

/* ---- controls ------------------------------------------------------------ */

const prefer = <T,>(prop: T | undefined, label: T): T => (prop === undefined ? label : prop);
const show = (rows: Record<string, boolean | undefined> | undefined, key: string) =>
  rows?.[key] !== false;

/** One choice from a set, as segmented buttons named by the row. */
function Choice<T extends string>({
  options,
  names,
  value,
  onChange,
  name,
}: {
  options: readonly T[];
  names: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
  name: string;
}) {
  return (
    <Options
      name={name}
      value={value}
      defaultValue={options[0]}
      onValueChange={(next) => onChange(next as T)}
      buttons={options.map((option) => ({ label: names[option], value: option }))}
    />
  );
}

/** A number on its range, named by the row. */
function Amount({
  value,
  range: [min, max],
  onChange,
  name,
}: {
  value: number;
  range: readonly [number, number];
  onChange: (value: number) => void;
  name: string;
}) {
  const groupName = useGroupName(name);
  return (
    <div className={styles.amount}>
      <Slider
        min={min}
        max={max}
        step={0.01}
        value={value}
        onValueChange={(next) => onChange(Math.round(next * 100) / 100)}
        {...groupName}
      />
    </div>
  );
}

function OnOff({
  checked,
  onChange,
  name,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  name: string;
}) {
  const groupName = useGroupName(name);
  return <Switch checked={checked} onCheckedChange={onChange} {...groupName} />;
}

/** Enter and Space choose a swatch, as they would a native button. */
function activateOnKey(event: KeyboardEvent<HTMLElement>, activate: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activate();
}

const SCHEMES: Scheme[] = ["brand", "accent", "neutral"];
const isScheme = (color: string | undefined): color is Scheme => SCHEMES.includes(color as Scheme);

/** The body color: the theme's three schemes, or a color of your own. */
function ColorRow({ label, ...rest }: StyleRowProps) {
  const { value, set } = useMascotPanel();
  const labels = useLabels();
  const color = shown(value).color;
  const custom = !isScheme(color);
  const [last, setLast] = useState(custom ? color : "#ff7a59");
  const groupName = useGroupName(labels.rows.color);
  const swatch = (key: Scheme | "custom", paint: string) => {
    const checked = key === "custom" ? custom : color === key;
    const choose = () => set({ color: key === "custom" ? last : key });
    return (
      <Flex
        key={key}
        center
        role="radio"
        aria-checked={checked}
        aria-label={labels.colorSwatch(labels.options.colors[key])}
        tabIndex={checked ? 0 : -1}
        className={classNames(swatchStyles.select, checked && swatchStyles.selected)}
        onClick={choose}
        onKeyDown={(event) => activateOnKey(event, choose)}
      >
        <span className={styles.swatch} style={{ background: paint }} />
      </Flex>
    );
  };
  return (
    <Row label={prefer(label, labels.rows.color)} {...rest}>
      <Flex vertical="center" gap="8" wrap>
        <Flex gap="4" role="radiogroup" {...groupName} onKeyDown={radioGroupKeyDown}>
          {SCHEMES.map((scheme) => swatch(scheme, `var(--function-${scheme}-500)`))}
          {swatch(
            "custom",
            custom ? color : "conic-gradient(#ff5a5f, #ffc93c, #3fbf6f, #4d9fff, #7c5cff, #ff5a5f)",
          )}
        </Flex>
        {custom && (
          <Flex maxWidth={10}>
            <ColorInput
              id="mascot-panel-color"
              aria-label={labels.options.colors.custom}
              value={/^#[0-9a-f]{6}$/i.test(color) ? color : ""}
              onValueChange={(next) => {
                if (!next) return;
                setLast(next);
                set({ color: next });
              }}
            />
          </Flex>
        )}
      </Flex>
    </Row>
  );
}

/** An optional color: off follows the mascot, on takes a color of its own. */
function OptionalColor({
  value,
  onChange,
  name,
  fallback,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  name: string;
  fallback: string;
}) {
  const groupName = useGroupName(name);
  const hex = value && /^#[0-9a-f]{6}$/i.test(value) ? value : "";
  return (
    <Flex vertical="center" gap="8">
      <Switch
        checked={value !== undefined}
        onCheckedChange={(on) => onChange(on ? (value ?? fallback) : undefined)}
        {...groupName}
      />
      {value !== undefined && (
        <Flex maxWidth={10}>
          <ColorInput
            id={`mascot-panel-${name.replace(/\W+/g, "-").toLowerCase()}`}
            aria-label={name}
            value={hex}
            onValueChange={(next) => next && onChange(next)}
          />
        </Flex>
      )}
    </Flex>
  );
}

/* ---- groups -------------------------------------------------------------- */

/** Which rows a group shows. Omitted keys stay visible. */
export interface MascotPanelVisibility {
  preview?: { section?: boolean; state?: boolean; mood?: boolean; actions?: boolean };
  body?: {
    section?: boolean;
    color?: boolean;
    roundness?: boolean;
    aspect?: boolean;
    surface?: boolean;
  };
  eyes?: {
    section?: boolean;
    eyes?: boolean;
    eyeSize?: boolean;
    eyeSpacing?: boolean;
    eyeHeight?: boolean;
    eyeColor?: boolean;
  };
  face?: { section?: boolean; mouth?: boolean; brows?: boolean; cheeks?: boolean };
  accessories?: { section?: boolean; accessories?: boolean; accessoryColor?: boolean };
  working?: { section?: boolean; working?: boolean; sides?: boolean; face?: boolean };
  motion?: { section?: boolean; personality?: boolean };
}

function useHeading(group: GroupKey, { title, description }: StyleGroupProps) {
  const labels = useLabels().groups[group];
  return {
    title: prefer(title, labels.title),
    description: prefer(description, labels.description),
  };
}

function BodyGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: MascotPanelVisibility["body"] }) {
  const { value, set } = useMascotPanel();
  const labels = useLabels();
  const look = shown(value);
  return (
    <Group {...useHeading("body", { title, description })} {...rest}>
      {show(rows, "color") && <ColorRow />}
      {show(rows, "roundness") && (
        <Row label={labels.rows.roundness}>
          <Amount
            name={labels.rows.roundness}
            value={look.roundness}
            range={MASCOT_DESIGN_RANGES.roundness}
            onChange={(roundness) => set({ roundness })}
          />
        </Row>
      )}
      {show(rows, "aspect") && (
        <Row label={labels.rows.aspect}>
          <Amount
            name={labels.rows.aspect}
            value={look.aspect}
            range={MASCOT_DESIGN_RANGES.aspect}
            onChange={(aspect) => set({ aspect })}
          />
        </Row>
      )}
      {show(rows, "surface") && (
        <Row label={labels.rows.surface}>
          <Choice
            name={labels.rows.surface}
            options={["glossy", "matte", "flat", "glass"] as const}
            names={labels.options.surface}
            value={look.surface}
            onChange={(surface) => set({ surface })}
          />
        </Row>
      )}
    </Group>
  );
}

function EyesGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: MascotPanelVisibility["eyes"] }) {
  const { value, set } = useMascotPanel();
  const labels = useLabels();
  const look = shown(value);
  const shape: EyeShape = typeof look.eyes === "string" ? look.eyes : "tile";
  return (
    <Group {...useHeading("eyes", { title, description })} {...rest}>
      {show(rows, "eyes") && (
        <Row label={labels.rows.eyes}>
          <Choice
            name={labels.rows.eyes}
            options={["tile", "pill", "round", "wide", "dot"] as const}
            names={labels.options.eyes}
            value={shape}
            onChange={(eyes) => set({ eyes })}
          />
        </Row>
      )}
      {(
        [
          ["eyeSize", look.eyeSize],
          ["eyeSpacing", look.eyeSpacing],
          ["eyeHeight", look.eyeHeight],
        ] as const
      ).map(
        ([key, amount]) =>
          show(rows, key) && (
            <Row key={key} label={labels.rows[key]}>
              <Amount
                name={labels.rows[key]}
                value={amount}
                range={MASCOT_DESIGN_RANGES[key]}
                onChange={(next) => set({ [key]: next })}
              />
            </Row>
          ),
      )}
      {show(rows, "eyeColor") && (
        <Row label={labels.rows.eyeColor}>
          <OptionalColor
            name={labels.rows.eyeColor}
            value={value.eyeColor}
            fallback="#1b1e24"
            onChange={(eyeColor) => set({ eyeColor })}
          />
        </Row>
      )}
    </Group>
  );
}

function FaceGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: MascotPanelVisibility["face"] }) {
  const { value, set } = useMascotPanel();
  const labels = useLabels();
  const look = shown(value);
  return (
    <Group {...useHeading("face", { title, description })} {...rest}>
      {show(rows, "mouth") && (
        <Row label={labels.rows.mouth}>
          <Choice
            name={labels.rows.mouth}
            options={["none", "smile", "dot", "line"] as const}
            names={labels.options.mouth}
            value={look.mouth}
            onChange={(mouth) => set({ mouth })}
          />
        </Row>
      )}
      {show(rows, "brows") && (
        <Row label={labels.rows.brows}>
          <OnOff
            name={labels.rows.brows}
            checked={look.brows}
            onChange={(brows) => set({ brows })}
          />
        </Row>
      )}
      {show(rows, "cheeks") && (
        <Row label={labels.rows.cheeks}>
          <OnOff
            name={labels.rows.cheeks}
            checked={look.cheeks}
            onChange={(cheeks) => set({ cheeks })}
          />
        </Row>
      )}
    </Group>
  );
}

/** Each accessory as a tile with a small mascot wearing it; several can be on. */
function AccessoryTiles() {
  const { value, set } = useMascotPanel();
  const labels = useLabels();
  const worn = value.accessory ?? [];
  const groupName = useGroupName(labels.rows.accessories);
  const look = mascotDesignProps({ ...value, working: undefined, accessory: undefined });
  return (
    <Flex wrap gap="4" role="group" {...groupName} className={styles.tiles}>
      {MASCOT_ACCESSORIES.map((name) => {
        const on = worn.includes(name);
        return (
          <ToggleButton
            key={name}
            selected={on}
            aria-pressed={on}
            aria-label={labels.options.accessories[name]}
            title={labels.options.accessories[name]}
            variant="ghost"
            className={styles.tile}
            onClick={() =>
              set({
                accessory: on
                  ? worn.filter((item) => item !== name)
                  : MASCOT_ACCESSORIES.filter((item) => item === name || worn.includes(item)),
              })
            }
          >
            <Mascot
              {...look}
              accessory={name}
              accessoryColor={value.accessoryColor}
              size={40}
              lookAt="center"
              poke={false}
              aria-hidden
            />
          </ToggleButton>
        );
      })}
    </Flex>
  );
}

function AccessoriesGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: MascotPanelVisibility["accessories"] }) {
  const { value, set } = useMascotPanel();
  const labels = useLabels();
  return (
    <Group {...useHeading("accessories", { title, description })} {...rest}>
      {show(rows, "accessories") && (
        <Row label={labels.rows.accessories} vertical="start">
          <AccessoryTiles />
        </Row>
      )}
      {show(rows, "accessoryColor") && (
        <Row label={labels.rows.accessoryColor}>
          <OptionalColor
            name={labels.rows.accessoryColor}
            value={value.accessoryColor}
            fallback="#ffc93c"
            onChange={(accessoryColor) => set({ accessoryColor })}
          />
        </Row>
      )}
    </Group>
  );
}

function WorkingGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: MascotPanelVisibility["working"] }) {
  const { value, set } = useMascotPanel();
  const labels = useLabels();
  const working = value.working ?? "none";
  const sides = typeof value.sides === "string" ? value.sides : "classic";
  return (
    <Group {...useHeading("working", { title, description })} {...rest}>
      {show(rows, "working") && (
        <Row label={labels.rows.working}>
          <Choice
            name={labels.rows.working}
            options={["none", "cube", "d20"] as const}
            names={labels.options.working}
            value={working}
            onChange={(next) => set({ working: next === "none" ? undefined : next })}
          />
        </Row>
      )}
      {working !== "none" && show(rows, "sides") && (
        <Row label={labels.rows.sides}>
          <Choice
            name={labels.rows.sides}
            options={["classic", "tints", "mono"] as const}
            names={labels.options.sides}
            value={sides}
            onChange={(next) => set({ sides: next })}
          />
        </Row>
      )}
      {working !== "none" && show(rows, "face") && (
        <Row label={labels.rows.face}>
          <Choice
            name={labels.rows.face}
            options={["3d", "flat"] as const}
            names={labels.options.face}
            value={value.face ?? "3d"}
            onChange={(face) => set({ face })}
          />
        </Row>
      )}
    </Group>
  );
}

function MotionGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: MascotPanelVisibility["motion"] }) {
  const { value, set } = useMascotPanel();
  const labels = useLabels();
  return (
    <Group {...useHeading("motion", { title, description })} {...rest}>
      {show(rows, "personality") && (
        <Row label={labels.rows.personality}>
          <Choice
            name={labels.rows.personality}
            options={["calm", "default", "bouncy"] as const}
            names={labels.options.personality}
            value={shown(value).personality}
            onChange={(personality) => set({ personality })}
          />
        </Row>
      )}
    </Group>
  );
}

/* ---- preview and actions ------------------------------------------------- */

const ACCESSORY_CHANCE = 0.45;

/** A whole new look, keeping how it works. */
export function randomMascotDesign(keep?: Pick<MascotDesign, "working" | "sides" | "face">) {
  const look = mascotLook(Math.random().toString(36).slice(2));
  const accessory =
    Math.random() < ACCESSORY_CHANCE
      ? [MASCOT_ACCESSORIES[Math.floor(Math.random() * MASCOT_ACCESSORIES.length)]]
      : undefined;
  return parseMascotDesign({ ...look, accessory, ...keep });
}

function useFlash() {
  const [flashed, setFlashed] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [
    flashed,
    (key: string) => {
      setFlashed(key);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setFlashed(null), 1400);
    },
  ] as const;
}

export interface MascotPanelActionsProps extends React.ComponentProps<typeof Flex> {
  /**
   * More export buttons after the free ones: a product's own, or Pro ones such
   * as animated emotes. Each can read the design with `useMascotPanel()`.
   */
  exports?: ReactNode;
  /** The file name downloads start with. */
  filename?: string;
}

/**
 * Randomize, Reset, and the free exports: the design as JSON or JSX, and the
 * flat mascot as an SVG or PNG file.
 */
function Actions({ exports, filename = "mascot", ...rest }: MascotPanelActionsProps) {
  const { value, replace } = useMascotPanel();
  const labels = useLabels();
  const [flashed, flash] = useFlash();
  // The files are drawn from a still, flat mascot kept out of sight, so they
  // are the same whatever the preview is doing, cube and d20 included.
  const still = useRef<HTMLDivElement>(null);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(key);
    } catch {
      // No clipboard (an insecure page, a denied permission): nothing to undo.
    }
  };

  const svgText = () => {
    const svg = still.current?.querySelector("svg");
    return svg ? standaloneSvg(svg) : null;
  };

  return (
    <Flex wrap gap="8" {...rest}>
      <Button
        size="s"
        variant="secondary"
        prefixIcon="sparkle"
        onClick={() => replace(randomMascotDesign(value))}
      >
        {labels.actions.randomize}
      </Button>
      <Button size="s" variant="tertiary" onClick={() => replace({ v: 1 })}>
        {labels.actions.reset}
      </Button>
      <Button size="s" variant="tertiary" onClick={() => copy("json", designJson(value))}>
        {flashed === "json" ? labels.actions.copied : labels.actions.copyJson}
      </Button>
      <Button size="s" variant="tertiary" onClick={() => copy("jsx", designJsx(value))}>
        {flashed === "jsx" ? labels.actions.copied : labels.actions.copyJsx}
      </Button>
      <Button
        size="s"
        variant="tertiary"
        prefixIcon="download"
        onClick={() => {
          const text = svgText();
          if (text) download(text, `${filename}.svg`, "image/svg+xml");
        }}
      >
        {labels.actions.downloadSvg}
      </Button>
      <Button
        size="s"
        variant="tertiary"
        prefixIcon="download"
        onClick={async () => {
          const text = svgText();
          if (text) download(await svgToPng(text), `${filename}.png`);
        }}
      >
        {labels.actions.downloadPng}
      </Button>
      {exports}
      <div ref={still} className={styles.still} aria-hidden>
        <Mascot
          {...mascotDesignProps({ ...value, working: undefined })}
          size="xl"
          lookAt="center"
          poke={false}
          effects={false}
        />
      </div>
    </Flex>
  );
}

function Preview({
  title,
  description,
  rows,
  exports,
  ...rest
}: StyleGroupProps & {
  rows?: MascotPanelVisibility["preview"];
  /** More export buttons, after the free ones. */
  exports?: ReactNode;
}) {
  const { value, trial, setTrial } = useMascotPanel();
  const labels = useLabels();
  const heading = useHeading("preview", { title, description });
  // State and mood hold many options: they get the row's width, under their label.
  return (
    <StylePanelStackedContext.Provider value>
      <Group {...heading} {...rest}>
        <Flex fillWidth center paddingY="32" className={styles.stage}>
          <Mascot
            {...mascotDesignProps(value)}
            state={trial.state}
            mood={trial.mood}
            size="xl"
            aria-label={labels.preview}
          />
        </Flex>
        {show(rows, "state") && (
          <Row label={labels.rows.state}>
            <Choice
              name={labels.rows.state}
              options={STATES}
              names={labels.options.state}
              value={trial.state}
              onChange={(state) => setTrial({ state })}
            />
          </Row>
        )}
        {show(rows, "mood") && (
          <Row label={labels.rows.mood}>
            <Options
              name={labels.rows.mood}
              value={trial.mood}
              defaultValue="neutral"
              onValueChange={(mood) => setTrial({ mood: mood as MascotMood })}
              buttons={MOODS.map((mood) => ({ label: labels.options.mood[mood], value: mood }))}
            />
          </Row>
        )}
        {show(rows, "actions") && <Actions padding="16" exports={exports} />}
      </Group>
    </StylePanelStackedContext.Provider>
  );
}

/** Use the panel's labels in a custom row. */
export const useMascotPanelLabels = useLabels;

export {
  AccessoriesGroup as MascotPanelAccessories,
  Actions as MascotPanelActions,
  BodyGroup as MascotPanelBody,
  ColorRow as MascotPanelColor,
  EyesGroup as MascotPanelEyes,
  FaceGroup as MascotPanelFace,
  MotionGroup as MascotPanelMotion,
  Preview as MascotPanelPreview,
  Root as MascotPanelRoot,
  WorkingGroup as MascotPanelWorking,
};
