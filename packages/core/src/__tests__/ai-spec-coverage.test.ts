import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import spec from "../../ai/spec.json";

/**
 * Public, documented API the harness used to leave out. `ThemeInit`, `Meta`,
 * `FocusTrap` and `ScrollLock` were on the generator's exclude list, and the
 * two media players live on the `./components/*` subpath that no barrel
 * re-exports — so an agent reading the harness never learned any of them
 * existed, though each has a docs page.
 */
type Entry = {
  group: string;
  importFrom?: string;
  call?: string;
  returns?: string;
  props?: Record<string, string>;
};
const components = spec.components as unknown as Record<string, Entry>;
const slice = (name: string) =>
  path.join(__dirname, "..", "..", "ai", "components", `${name}.json`);

describe("harness coverage", () => {
  it.each(["ThemeInit", "Meta", "FocusTrap", "ScrollLock", "MediaAudioPlayer", "MediaVideoPlayer"])(
    "%s has a spec entry with its props, and a slice",
    (name) => {
      expect(Object.keys(components[name]?.props ?? {}).length).toBeGreaterThan(0);
      expect(existsSync(slice(name))).toBe(true);
    },
  );

  it.each(["MediaAudioPlayer", "MediaVideoPlayer"])(
    "%s names the subpath it is imported from",
    (name) => {
      expect(components[name].importFrom).toBe(`@once-ui-system/core/components/${name}`);
      const fromSlice = JSON.parse(readFileSync(slice(name), "utf8"));
      expect(fromSlice.importFrom).toBe(components[name].importFrom);
    },
  );

  it("documents Meta as the call it is, with its argument as props", () => {
    expect(components.Meta.call).toBe("Meta.generate(props)");
    expect(components.Meta.returns).toBe("GeneratedMetadata");
    expect(components.Meta.props?.title).toBe("!string");
    expect(components.Meta.props?.baseURL).toBe("!string");
  });

  it("keeps an empty-string default visible", () => {
    expect(components.Meta.props?.path).toBe('string = ""');
  });
});
