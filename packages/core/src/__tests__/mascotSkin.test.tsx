import { render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { parseMascotDesign } from "../modules/ai/design";
import { Mascot } from "../modules/ai/Mascot";
import { cleanMascotUsername, fetchMascotSkin } from "../modules/ai/mascotSkin";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const SPROUT = { d: "M100 28V6", stroke: "rgba(0,0,0,0.55)", width: 4, place: "back" as const };

afterEach(() => vi.unstubAllGlobals());

describe("design layers", () => {
  it("keeps valid layers and drops unsafe ones", () => {
    const design = parseMascotDesign({
      v: 1,
      layers: [
        SPROUT,
        { d: "M0 0L10 10Z", fill: "body", transform: "translate(140 32) scale(-1 1)" },
        { d: "<script>", fill: "red" },
        { d: "M0 0Z", fill: "url(javascript:alert(1))", transform: "x;y" },
      ],
    });
    expect(design.layers).toEqual([
      SPROUT,
      { d: "M0 0L10 10Z", fill: "body", transform: "translate(140 32) scale(-1 1)" },
      { d: "M0 0Z" },
    ]);
  });

  it("draws layers on the mascot", () => {
    const { container } = render(<Mascot layers={[SPROUT]} />, { wrapper });
    expect(container.querySelector('path[d="M100 28V6"]')).not.toBeNull();
  });
});

describe("username skins", () => {
  it("cleans names as they are stored", () => {
    expect(cleanMascotUsername(" @FoxDev! ")).toBe("foxdev");
  });

  it("draws the skin the source returns, once per name", async () => {
    const fetch = vi.fn(async () =>
      Response.json({ design: { v: 1, color: "#2d69fa", mouth: "smile", layers: [SPROUT] } }),
    );
    vi.stubGlobal("fetch", fetch);
    const source = "https://skins.test/a";
    const { container } = render(
      <>
        <Mascot username="foxdev" skinSource={source} />
        <Mascot username="@FoxDev" skinSource={source} />
      </>,
      { wrapper },
    );
    await waitFor(() => expect(container.querySelectorAll('path[d="M100 28V6"]').length).toBe(2));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${source}/foxdev`, { credentials: "omit" });
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.visibility).not.toBe("hidden");
  });

  it("falls back to the name as a seed when the source fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 })),
    );
    const skin = await fetchMascotSkin("nobody", "https://skins.test/b");
    expect(skin).toBeNull();
    const { container } = render(<Mascot username="nobody" skinSource="https://skins.test/b" />, {
      wrapper,
    });
    await waitFor(() =>
      expect((container.firstElementChild as HTMLElement).style.visibility).not.toBe("hidden"),
    );
  });

  it("fetches nothing without a username", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<Mascot seed="foxdev" />, { wrapper });
    expect(fetch).not.toHaveBeenCalled();
  });
});
