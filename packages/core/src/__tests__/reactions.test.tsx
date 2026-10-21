import {
  act,
  render as baseRender,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Reaction } from "../modules/social/Reaction";
import { Reactions } from "../modules/social/Reactions";
import { type ReactionOption, reactionMotion } from "../modules/social/reactionMotion";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const render = (ui: ReactElement) => baseRender(ui, { wrapper });

const options: ReactionOption[] = [
  { value: "❤️", label: "Love" },
  { value: "👍", label: "Like" },
  { value: "😂", label: "Haha" },
];

describe("reactionMotion", () => {
  it("gives known emoji a fitting gesture, with or without the variation selector", () => {
    expect(reactionMotion({ value: "❤️" })).toBe("beat");
    expect(reactionMotion({ value: "❤" })).toBe("beat");
    expect(reactionMotion({ value: "👍" })).toBe("nod");
    expect(reactionMotion({ value: "😂" })).toBe("shake");
    expect(reactionMotion({ value: "🔥" })).toBe("flicker");
    expect(reactionMotion({ value: "🦄" })).toBe("bounce");
  });

  it("lets the option choose, and bounces an image by default", () => {
    expect(reactionMotion({ value: "❤️", motion: "spin" })).toBe("spin");
    expect(reactionMotion({ value: "party", src: "/party.webp" })).toBe("bounce");
    expect(reactionMotion({ value: "x", emoji: "😢" })).toBe("droop");
  });
});

describe("Reaction", () => {
  it("is a named image, or hidden when decorative", () => {
    const { rerender } = render(<Reaction value="❤️" label="Love" />);
    expect(screen.getByRole("img", { name: "Love" }).textContent).toBe("❤️");
    rerender(<Reaction value="❤️" label="Love" decorative />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("draws the image of a custom reaction", () => {
    const { container } = render(<Reaction value="party" label="Party" src="/party.webp" />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/party.webp");
  });

  it("does not move at first render, then plays on hover and on a new playKey", () => {
    const { container, rerender } = render(<Reaction value="❤️" playKey={0} />);
    const moving = () => container.querySelector("[class*='play']");
    expect(moving()).toBeNull();
    fireEvent.pointerEnter(screen.getByRole("img"));
    expect(moving()?.className).toMatch(/beat/);
    rerender(<Reaction value="👍" playKey={1} />);
    expect(moving()?.className).toMatch(/nod/);
  });

  it("loops when asked, and never for motion none", () => {
    const { container, rerender } = render(<Reaction value="🔥" trigger="loop" />);
    expect(container.querySelector("[class*='loop']")).not.toBeNull();
    rerender(<Reaction value="🔥" trigger="loop" motion="none" />);
    expect(container.querySelector("[class*='loop']")).toBeNull();
  });
});

describe("Reactions", () => {
  it("renders the same markup on the server", () => {
    const html = renderToString(
      <LayoutProvider>
        <Reactions options={options} counts={{ "❤️": 2 }} defaultValue="❤️" />
      </LayoutProvider>,
    );
    expect(html).toContain('aria-label="Love, 2"');
    expect(html).toContain('aria-pressed="true"');
  });

  it("shows the reactions in use, with counts, and an add button", () => {
    render(<Reactions options={options} counts={{ "❤️": 3, "😂": 1 }} />);
    const group = screen.getByRole("group", { name: "Reactions" });
    expect(within(group).getByRole("button", { name: "Love, 3" })).toBeTruthy();
    expect(within(group).getByRole("button", { name: "Haha, 1" })).toBeTruthy();
    expect(within(group).queryByRole("button", { name: /^Like/ })).toBeNull();
    expect(within(group).getByRole("button", { name: "Add reaction" })).toBeTruthy();
  });

  it("shows every option with showAll, and no numbers without counts", () => {
    render(<Reactions options={options} showAll picker={false} />);
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Love",
      "Like",
      "Haha",
    ]);
  });

  it("keeps one reaction per person and moves the counts at once, uncontrolled", () => {
    const onValueChange = vi.fn();
    render(
      <Reactions
        options={options}
        counts={{ "❤️": 3, "😂": 1 }}
        defaultValue="❤️"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Haha, 1" }));
    expect(screen.getByRole("button", { name: "Love, 2" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(screen.getByRole("button", { name: "Haha, 2" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(onValueChange).toHaveBeenLastCalledWith("😂", {
      option: options[2],
      selected: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Haha, 2" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null, { option: options[2], selected: false });
    expect(screen.getByRole("button", { name: "Haha, 1" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("settles on new counts from the server without counting the viewer twice", () => {
    const { rerender } = render(<Reactions options={options} counts={{ "👍": 1 }} showAll />);
    fireEvent.click(screen.getByRole("button", { name: "Like, 1" }));
    expect(screen.getByRole("button", { name: "Like, 2" })).toBeTruthy();
    // The server now counts the viewer's reaction.
    rerender(<Reactions options={options} counts={{ "👍": 2 }} showAll />);
    expect(screen.getByRole("button", { name: "Like, 2" })).toBeTruthy();
  });

  it("allows several with multiple, controlled", () => {
    function Chat() {
      const [value, setValue] = useState<string[]>(["👍"]);
      return (
        <Reactions
          options={options}
          showAll
          multiple
          value={value}
          onValueChange={(next) => setValue(next as string[])}
        />
      );
    }
    render(<Chat />);
    fireEvent.click(screen.getByRole("button", { name: "Love" }));
    expect(screen.getByRole("button", { name: "Love" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Like" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps a counted reaction the options no longer list", () => {
    render(<Reactions options={options} counts={{ retired: 2 }} picker={false} />);
    expect(screen.getByRole("button", { name: "retired, 2" })).toBeTruthy();
  });

  it("adds from the picker and closes it", async () => {
    const onValueChange = vi.fn();
    render(<Reactions options={options} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Add reaction" }));
    const menu = await screen.findByRole("group", { name: "Add reaction" });
    fireEvent.click(within(menu).getByRole("button", { name: "Like" }));
    expect(onValueChange).toHaveBeenCalledWith("👍", { option: options[1], selected: true });
    await waitFor(() => expect(screen.queryByRole("group", { name: "Add reaction" })).toBeNull());
    expect(screen.getByRole("button", { name: "Like" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("bursts copies of the reaction when one is added, and clears them", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<Reactions options={options} showAll picker={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Love" }));
      expect(container.querySelectorAll("[class*='particle']")).toHaveLength(6);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(container.querySelectorAll("[class*='particle']")).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does nothing when disabled", () => {
    const onValueChange = vi.fn();
    render(
      <Reactions options={options} showAll disabled onValueChange={onValueChange} picker={false} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Love" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Reactions options={options} counts={{ "❤️": 3 }} defaultValue="❤️" />,
    );
    await expectNoAxeViolations(container);
  });
});
