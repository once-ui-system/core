export type StaticSpacingToken =
  | "0"
  | "1"
  | "2"
  | "4"
  | "8"
  | "12"
  | "16"
  | "20"
  | "24"
  | "32"
  | "40"
  | "48"
  | "56"
  | "64"
  | "72"
  | "80"
  | "104"
  | "128"
  | "160";

export const schemes = [
  "blue",
  "indigo",
  "violet",
  "magenta",
  "pink",
  "red",
  "orange",
  "yellow",
  "moss",
  "green",
  "emerald",
  "aqua",
  "cyan",
];

export type Schemes =
  | "blue"
  | "indigo"
  | "violet"
  | "magenta"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "moss"
  | "green"
  | "emerald"
  | "aqua"
  | "cyan";

export type CondensedTShirtSizes = "s" | "m" | "l";

export type TShirtSizes = CondensedTShirtSizes | "xs" | "xl";

/**
 * The sizes a text field takes: `Input`, `Textarea`, `Form` and every field
 * built on `Input`. The t-shirt scale plus `"xxs"`, a 32px field the height of
 * a small `Button`, for dense toolbars. Field heights run a step above the
 * button scale (`xs` is 40px, `s` 48px), so the toolbar size needed a name
 * below `xs` rather than a new meaning for `s`.
 */
export type FieldSize = TShirtSizes | "xxs";

export type ResponsiveSpacingToken = TShirtSizes;

export type ShadowSize = TShirtSizes;

export type SpacingToken = StaticSpacingToken | ResponsiveSpacingToken;

/**
 * A CSS length written as a string, passed through inline as written:
 * `"320px"`, `"40rem"`, `"1.5em"`, `"50%"`, `"100vh"`, `"100dvh"`, `"50vw"`,
 * or a `calc()`, `min()`, `max()`, `clamp()` or `var()` expression.
 *
 * A bare number on a size, spacing or offset prop is on the token scale
 * (`width={320}` is 20rem, scaled by `[data-scaling]`), as a digit string
 * is a static spacing token (`"16"` is `--static-space-16`): `16` and `"16"`
 * render the same.
 */
export type CSSUnit =
  | `${number}px`
  | `${number}rem`
  | `${number}em`
  | `${number}ch`
  | `${number}%`
  | `${number}vh`
  | `${number}vw`
  | `${number}dvh`
  | `${number}dvw`
  | `${number}svh`
  | `${number}svw`
  | `${number}lvh`
  | `${number}lvw`
  | `${number}vmin`
  | `${number}vmax`
  | `${number}cqw`
  | `${number}cqh`
  | `calc(${string})`
  | `min(${string})`
  | `max(${string})`
  | `clamp(${string})`
  | `var(${string})`;

export type Opacity = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;

export type ColorScheme =
  | "neutral"
  | "brand"
  | "accent"
  | "info"
  | "danger"
  | "warning"
  | "success";

/**
 * Which semantic palette a component draws in. It is the only prop that
 * carries this meaning in 3.0: `variant` says how a component looks
 * (`primary`, `ghost`…), and `scheme` names a palette hue (`blue`, `green`…).
 */
export type Tone = ColorScheme;

export type ColorCategory = "on-solid" | "on-background";

export type ColorWeight = "weak" | "medium" | "strong";

export type Colors = `${ColorScheme}-${ColorWeight}` | `${ColorScheme}-alpha-${ColorWeight}`;

/**
 * A design token, or any CSS colour.
 *
 * The `(string & {})` arm is what keeps token autocomplete alive: a bare
 * `Colors | string` collapses to `string` and the editor stops suggesting
 * anything, whereas this keeps the literal union suggestible while still
 * accepting `#fff`, `rgb(...)` or `var(...)`.
 *
 * Used where a value is painted into SVG or canvas rather than through a class,
 * so a raw CSS colour is a legitimate escape hatch rather than a mistake.
 */
export type ColorValue = Colors | (string & {});

export type RadiusSize = TShirtSizes | "full" | "none";

/**
 * A blur radius on the t-shirt scale: `xs` 0.25rem, `s` 0.5rem, `m` 1rem,
 * `l` 2rem, `xl` 3rem (the static spacing steps 4, 8, 16, 32 and 48).
 */
export type BlurSize = TShirtSizes;

/** `mix-blend-mode`: every keyword, plus `plus-lighter` for additive glows. */
export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity"
  | "plus-lighter";

/** `user-select`. */
export type UserSelect = "none" | "text" | "all" | "auto";

export type RadiusNest = "4" | "8";

export type TextType = "body" | "heading" | "display" | "label" | "code";

export type TextWeight = "default" | "normal" | "medium" | "strong";

export type TextSize = TShirtSizes;

export type TextVariant = `${TextType}-${TextWeight}-${TextSize}`;

export type GridSize =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export type FlexValue =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export type Language =
  | "abap"
  | "abnf"
  | "actionscript"
  | "ada"
  | "agda"
  | "al"
  | "antlr4"
  | "apacheconf"
  | "apex"
  | "apl"
  | "applescript"
  | "aql"
  | "arduino"
  | "arff"
  | "armasm"
  | "arturo"
  | "asciidoc"
  | "asm6502"
  | "asmatmel"
  | "aspnet"
  | "autohotkey"
  | "autoit"
  | "avisynth"
  | "avro-idl"
  | "awk"
  | "bash"
  | "basic"
  | "batch"
  | "bbcode"
  | "bbj"
  | "bicep"
  | "birb"
  | "bison"
  | "bnf"
  | "bqn"
  | "brainfuck"
  | "brightscript"
  | "bro"
  | "bsl"
  | "c"
  | "cfscript"
  | "chaiscript"
  | "cil"
  | "cilkc"
  | "cilkcpp"
  | "clike"
  | "clojure"
  | "cmake"
  | "cobol"
  | "coffeescript"
  | "concurnas"
  | "cooklang"
  | "coq"
  | "core"
  | "cpp"
  | "crystal"
  | "csharp"
  | "cshtml"
  | "csp"
  | "css-extras"
  | "css"
  | "csv"
  | "cue"
  | "cypher"
  | "d"
  | "dart"
  | "dataweave"
  | "dax"
  | "dhall"
  | "diff"
  | "django"
  | "dns-zone-file"
  | "docker"
  | "dot"
  | "ebnf"
  | "editorconfig"
  | "eiffel"
  | "ejs"
  | "elixir"
  | "elm"
  | "erb"
  | "erlang"
  | "etlua"
  | "excel-formula"
  | "factor"
  | "false"
  | "firestore-security-rules"
  | "flow"
  | "fortran"
  | "fsharp"
  | "ftl"
  | "gap"
  | "gcode"
  | "gdscript"
  | "gedcom"
  | "gettext"
  | "gherkin"
  | "git"
  | "glsl"
  | "gml"
  | "gn"
  | "go-module"
  | "go"
  | "gradle"
  | "graphql"
  | "groovy"
  | "haml"
  | "handlebars"
  | "haskell"
  | "haxe"
  | "hcl"
  | "hlsl"
  | "hoon"
  | "hpkp"
  | "hsts"
  | "http"
  | "ichigojam"
  | "icon"
  | "icu-message-format"
  | "idris"
  | "iecst"
  | "ignore"
  | "inform7"
  | "ini"
  | "io"
  | "j"
  | "java"
  | "javadoc"
  | "javadoclike"
  | "javascript"
  | "javastacktrace"
  | "jexl"
  | "jolie"
  | "jq"
  | "js-extras"
  | "js-templates"
  | "jsdoc"
  | "json"
  | "json5"
  | "jsonp"
  | "jsstacktrace"
  | "jsx"
  | "julia"
  | "keepalived"
  | "keyman"
  | "kotlin"
  | "kumir"
  | "kusto"
  | "latex"
  | "latte"
  | "less"
  | "lilypond"
  | "linker-script"
  | "liquid"
  | "lisp"
  | "livescript"
  | "llvm"
  | "log"
  | "lolcode"
  | "lua"
  | "magma"
  | "makefile"
  | "markdown"
  | "markup-templating"
  | "markup"
  | "mata"
  | "matlab"
  | "maxscript"
  | "mel"
  | "mermaid"
  | "metafont"
  | "mizar"
  | "mongodb"
  | "monkey"
  | "moonscript"
  | "n1ql"
  | "n4js"
  | "nand2tetris-hdl"
  | "naniscript"
  | "nasm"
  | "neon"
  | "nevod"
  | "nginx"
  | "nim"
  | "nix"
  | "nsis"
  | "objectivec"
  | "ocaml"
  | "odin"
  | "opencl"
  | "openqasm"
  | "oz"
  | "parigp"
  | "parser"
  | "pascal"
  | "pascaligo"
  | "pcaxis"
  | "peoplecode"
  | "perl"
  | "php-extras"
  | "php"
  | "phpdoc"
  | "plant-uml"
  | "plsql"
  | "powerquery"
  | "powershell"
  | "processing"
  | "prolog"
  | "promql"
  | "properties"
  | "protobuf"
  | "psl"
  | "pug"
  | "puppet"
  | "pure"
  | "purebasic"
  | "purescript"
  | "python"
  | "q"
  | "qml"
  | "qore"
  | "qsharp"
  | "r"
  | "racket"
  | "reason"
  | "regex"
  | "rego"
  | "renpy"
  | "rescript"
  | "rest"
  | "rip"
  | "roboconf"
  | "robotframework"
  | "ruby"
  | "rust"
  | "sas"
  | "sass"
  | "scala"
  | "scheme"
  | "scss"
  | "shell-session"
  | "smali"
  | "smalltalk"
  | "smarty"
  | "sml"
  | "solidity"
  | "solution-file"
  | "soy"
  | "sparql"
  | "splunk-spl"
  | "sqf"
  | "sql"
  | "squirrel"
  | "stan"
  | "stata"
  | "stylus"
  | "supercollider"
  | "swift"
  | "systemd"
  | "t4-cs"
  | "t4-templating"
  | "t4-vb"
  | "tap"
  | "tcl"
  | "textile"
  | "toml"
  | "tremor"
  | "tsx"
  | "tt2"
  | "turtle"
  | "twig"
  | "typescript"
  | "typoscript"
  | "unrealscript"
  | "uorazor"
  | "uri"
  | "v"
  | "vala"
  | "vbnet"
  | "velocity"
  | "verilog"
  | "vhdl"
  | "vim"
  | "visual-basic"
  | "warpscript"
  | "wasm"
  | "web-idl"
  | "wgsl"
  | "wiki"
  | "wolfram"
  | "wren"
  | "xeora"
  | "xml-doc"
  | "xojo"
  | "xquery"
  | "yaml"
  | "yang"
  | "zig";

export type ToastPosition = "top" | "bottom";

/**
 * Where a floating element sits relative to its trigger.
 *
 * Declared here rather than re-exported from the positioning library so the
 * public API names no vendor: `placement` is part of the contract of Select,
 * UserMenu, ContextMenu, CursorCard, DropdownWrapper and Animation, and a
 * consumer's types should not have to resolve @floating-ui to use them.
 * Structurally identical to that library's `Placement`, so it still passes
 * straight into `useFloating` while the implementation stays an internal
 * detail we can change without a breaking release.
 */
export type Side = "top" | "right" | "bottom" | "left";
export type Alignment = "start" | "end";
export type Placement = Side | `${Side}-${Alignment}`;

/**
 * How fast an effect runs, as a multiplier on its designed pace: `1` is the
 * default, `2` twice as fast, `0.5` half. The keywords are the same numbers:
 * `"slow"` 0.5, `"medium"` 1, `"fast"` 2. A length of time is never a speed;
 * effects that run for a set time take a `duration` in milliseconds instead.
 */
export type Speed = "slow" | "medium" | "fast" | number;
