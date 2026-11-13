// Ambient declaration for the SCSS module imports. Under `src/`, so
// tsconfig.build.json (whose `include` and `rootDir` are `src`) picks it up.
// The build compiles each `.module.scss` to the `.module.css` the emitted JS
// imports (core's scripts/compile-css-modules.cjs).
declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
