// biome-ignore-all lint/suspicious/noExplicitAny: a stand-in for WebGLRenderer, typed only as far as the tests read it
import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import type * as Three from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider, ThemeProvider } from "../contexts/index.js";
import { sceneColorVariable } from "../modules/scene/color.js";

/**
 * jsdom has no WebGL, so the renderer is a stand-in that records what the
 * scene asks of it; everything else is the real three.js.
 */
const calls = vi.hoisted(() => ({
  renderers: [] as any[],
  fail: false,
}));

vi.mock("three", async (importOriginal) => {
  const actual = await importOriginal<typeof import("three")>();
  class FakeRenderer {
    domElement = document.createElement("canvas");
    shadowMap = { enabled: false, type: 0 };
    outputColorSpace = "";
    toneMapping = 0;
    render = vi.fn();
    setPixelRatio = vi.fn();
    setClearColor = vi.fn();
    setSize = vi.fn();
    dispose = vi.fn();
    constructor() {
      if (calls.fail) throw new Error("Error creating WebGL context");
      calls.renderers.push(this);
    }
  }
  return { ...actual, WebGLRenderer: FakeRenderer };
});

const { Scene, SceneGroup, SceneLabel, SceneMesh, useScene, useSceneFrame } = await import(
  "../modules/scene/index.js"
);

let frames: FrameRequestCallback[] = [];
const flushFrames = async () => {
  await act(async () => {
    const pending = frames;
    frames = [];
    for (const frame of pending) frame(performance.now());
  });
};

// The scene loads its implementation lazily: wait until it has started.
const settle = async () => {
  await vi.waitFor(() => {
    if (calls.renderers.length === 0 && !calls.fail) throw new Error("scene not started yet");
  });
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
};

const wrap = (ui: React.ReactElement) => (
  <ThemeProvider>
    <LayoutProvider>{ui}</LayoutProvider>
  </ThemeProvider>
);

beforeEach(() => {
  calls.renderers.length = 0;
  calls.fail = false;
  frames = [];
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  // On screen from the start, so the loop is allowed to run.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe() {
        this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as any);
      }
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    },
  );
});
afterEach(() => vi.unstubAllGlobals());
afterEach(() => vi.restoreAllMocks());

describe("sceneColorVariable", () => {
  it("reads a tone and weight from the tone's hue scale, whatever data-solid says", () => {
    expect(sceneColorVariable("brand-strong")).toBe("--function-brand-500");
    expect(sceneColorVariable("neutral-weak")).toBe("--function-neutral-900");
    expect(sceneColorVariable("neutral-alpha-weak")).toBe("--neutral-alpha-weak");
  });

  it("passes custom properties through and leaves CSS colours alone", () => {
    expect(sceneColorVariable("--page-background")).toBe("--page-background");
    expect(sceneColorVariable("#ff8800")).toBeNull();
    expect(sceneColorVariable("rebeccapurple")).toBeNull();
  });
});

describe("Scene", () => {
  it("renders an empty, named frame on the server", () => {
    const html = renderToString(
      <ThemeProvider>
        <Scene labels={{ scene: "Robot KR-07" }} />
      </ThemeProvider>,
    );
    expect(html).toContain('aria-label="Robot KR-07"');
    expect(html).toContain('aria-busy="true"');
  });

  it("starts one renderer and names its canvas", async () => {
    const { container } = render(wrap(<Scene labels={{ scene: "Rover" }} />));
    await settle();
    expect(calls.renderers).toHaveLength(1);
    const canvas = container.querySelector("canvas");
    expect(canvas?.getAttribute("aria-label")).toBe("Rover");
    expect(canvas?.getAttribute("role")).toBe("img");
  });

  it("shows a message instead of a canvas when WebGL is off", async () => {
    calls.fail = true;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { findByText } = render(wrap(<Scene labels={{ unavailable: "No 3D here" }} />));
    expect(await findByText("No 3D here")).toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
  });

  it("adds meshes under their group and removes them on unmount", async () => {
    let scene: Three.Scene | null = null;
    const Probe = () => {
      scene = useScene().scene;
      return null;
    };
    const group = createRef<Three.Group>();
    const view = render(
      wrap(
        <Scene>
          <Probe />
          <SceneGroup ref={group} name="robot" position={[1, 0, 0]}>
            <SceneMesh name="head" geometry="sphere" args={[0.4]} color="brand-strong" />
          </SceneGroup>
        </Scene>,
      ),
    );
    await settle();
    const robot = (scene as unknown as Three.Scene).getObjectByName("robot");
    expect(robot).toBe(group.current);
    expect(robot?.position.x).toBe(1);
    expect(robot?.getObjectByName("head")).toBeDefined();
    view.rerender(wrap(<Scene />));
    await settle();
    expect((scene as unknown as Three.Scene | null)?.getObjectByName("robot")).toBeUndefined();
  });

  it("draws on demand and stops the loop when nothing animates", async () => {
    render(wrap(<Scene controls="none" />));
    await settle();
    await flushFrames();
    const { render: draw } = calls.renderers[0];
    expect(draw).toHaveBeenCalled();
    expect(frames).toHaveLength(0);
  });

  it("keeps drawing while a frame callback is mounted", async () => {
    const spin = vi.fn();
    const Spinner = () => {
      useSceneFrame(spin);
      return null;
    };
    render(
      wrap(
        <Scene controls="none">
          <Spinner />
        </Scene>,
      ),
    );
    await settle();
    await flushFrames();
    await flushFrames();
    expect(spin.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(frames.length).toBe(1);
  });

  it("releases the GPU on unmount", async () => {
    const view = render(wrap(<Scene />));
    await settle();
    const renderer = calls.renderers[0];
    view.unmount();
    expect(renderer.dispose).toHaveBeenCalled();
  });

  it("portals labels into the scene's stage", async () => {
    const { findByText } = render(
      wrap(
        <Scene>
          <SceneLabel position={[0, 1, 0]}>
            <span>82%</span>
          </SceneLabel>
        </Scene>,
      ),
    );
    const label = await findByText("82%");
    expect(label.parentElement?.hasAttribute("data-hidden")).toBe(true);
    await flushFrames();
  });
});
