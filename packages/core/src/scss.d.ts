// Ambient declaration for SCSS module imports.
//
// Lives under `src/` so tsconfig.build.json actually picks it up — its
// `include` is scoped to the source directory and its `rootDir` forbids files
// above it. This declaration previously sat at the package root, outside that
// include, and the build only type-checked because Next's ambient declarations
// were in the graph via a `next` type import. Core no longer imports from
// `next` at all, so it declares this itself.
declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
