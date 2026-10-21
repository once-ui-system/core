import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { type ReactNode, useState } from "react";
import { Reaction, type ReactionOption, Reactions, reactionMotion, ThemeProvider } from "../src";
import { gestureTrack, REACTION_GESTURES } from "../src/components/reactionMotion";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

const options: ReactionOption[] = [
  { value: "❤️", label: "Love" },
  { value: "👍", label: "Like" },
  { value: "😂", label: "Haha" },
];

describe("reaction gestures", () => {
  it("match core's choice per emoji", () => {
    expect(reactionMotion({ value: "❤️" })).toBe("beat");
    expect(reactionMotion({ value: "👍" })).toBe("nod");
    expect(reactionMotion({ value: "🔥" })).toBe("flicker");
    expect(reactionMotion({ value: "party", src: "x.webp" })).toBe("bounce");
  });

  it("start and end at rest, as core's keyframes do", () => {
    for (const gesture of Object.values(REACTION_GESTURES)) {
      const scale = gestureTrack(gesture, "scaleX").outputRange;
      const turn = gestureTrack(gesture, "rotate").outputRange;
      expect(gesture.poses[0].at).toBe(0);
      expect(gesture.poses.at(-1)?.at).toBe(1);
      expect(scale[0]).toBe(1);
      expect(scale.at(-1)).toBe(1);
      expect(turn[0]).toBe(0);
      // A spin ends a full turn later, which looks the same.
      expect((turn.at(-1) ?? 0) % 360).toBe(0);
    }
  });
});

describe("Reaction", () => {
  it("is a named image, or hidden when decorative", async () => {
    await wrap(<Reaction value="❤️" label="Love" />);
    expect(screen.getByLabelText("Love")).toBeTruthy();
    await wrap(<Reaction value="❤️" label="Love" decorative />);
    expect(screen.queryByLabelText("Love")).toBeNull();
  });

  it("draws a custom reaction's image", async () => {
    await wrap(<Reaction value="party" label="Party" src="https://example.com/party.webp" />);
    const sources: unknown[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      const element = node as { type?: string; props?: { source?: unknown }; children?: unknown[] };
      if (element.type === "Image") sources.push(element.props?.source);
      element.children?.forEach(walk);
    };
    walk(screen.toJSON());
    expect(sources).toEqual([{ uri: "https://example.com/party.webp" }]);
  });
});

describe("Reactions", () => {
  it("shows the reactions in use with their counts, and an add button", async () => {
    await wrap(<Reactions options={options} counts={{ "❤️": 3, "😂": 1 }} />);
    expect(screen.getByRole("button", { name: "Love, 3" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Haha, 1" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Like/ })).toBeNull();
    expect(screen.getByLabelText("Add reaction")).toBeTruthy();
  });

  it("keeps one reaction per person and moves the counts at once", async () => {
    const onValueChange = jest.fn();
    await wrap(
      <Reactions
        options={options}
        counts={{ "❤️": 3, "😂": 1 }}
        defaultValue="❤️"
        onValueChange={onValueChange}
      />,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Haha, 1" }));
    expect(screen.getByRole("button", { name: "Love, 2", selected: false })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Haha, 2", selected: true })).toBeTruthy();
    expect(onValueChange).toHaveBeenLastCalledWith("😂", { option: options[2], selected: true });
  });

  it("settles on new counts without counting the viewer twice", async () => {
    const { rerender } = await wrap(<Reactions options={options} counts={{ "👍": 1 }} showAll />);
    await fireEvent.press(screen.getByRole("button", { name: "Like, 1" }));
    expect(screen.getByRole("button", { name: "Like, 2" })).toBeTruthy();
    await rerender(
      <ThemeProvider theme="dark">
        <Reactions options={options} counts={{ "👍": 2 }} showAll />
      </ThemeProvider>,
    );
    expect(screen.getByRole("button", { name: "Like, 2" })).toBeTruthy();
  });

  it("allows several with multiple, controlled", async () => {
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
    await wrap(<Chat />);
    await fireEvent.press(screen.getByRole("button", { name: "Love" }));
    expect(screen.getByRole("button", { name: "Love", selected: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Like", selected: true })).toBeTruthy();
  });

  it("bursts six copies when one is added, then clears them", async () => {
    await wrap(<Reactions options={options} showAll picker={false} />);
    await fireEvent.press(screen.getByRole("button", { name: "Love" }));
    // The chip's glyph, plus six flying copies; all hidden from screen readers.
    const hearts = () => screen.queryAllByText("❤️", { includeHiddenElements: true });
    expect(hearts()).toHaveLength(7);
    expect(screen.queryAllByText("❤️")).toHaveLength(0);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(hearts()).toHaveLength(1);
  });

  it("adds from the picker", async () => {
    const onValueChange = jest.fn();
    await wrap(<Reactions options={options} defaultOpen onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByRole("button", { name: "Like" }));
    expect(onValueChange).toHaveBeenCalledWith("👍", { option: options[1], selected: true });
  });

  it("does nothing when disabled", async () => {
    const onValueChange = jest.fn();
    await wrap(
      <Reactions options={options} showAll disabled picker={false} onValueChange={onValueChange} />,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Love" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
