import { render, screen, within } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { AvatarGroup } from "../components/AvatarGroup";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const people = [{ value: "AB" }, { value: "CD" }, { value: "EF" }, { value: "GH" }];

const avatars = () => screen.getAllByRole("img");

/**
 * A stack of avatars: every one stays a named image, `limit` folds the rest
 * into a "+N" avatar, and the stacking order follows `reverse`.
 */
describe("AvatarGroup", () => {
  it("renders every avatar as a named image", async () => {
    const { container } = render(<AvatarGroup avatars={people} />, { wrapper });
    expect(avatars().map((a) => a.textContent)).toEqual(["AB", "CD", "EF", "GH"]);
    expect(screen.getByRole("img", { name: "Avatar with initials AB" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("folds avatars past the limit into a +N avatar", async () => {
    const { container } = render(<AvatarGroup avatars={people} limit={2} />, { wrapper });
    expect(avatars().map((a) => a.textContent)).toEqual(["AB", "CD", "+2"]);
    expect(screen.getByRole("img", { name: "Avatar with initials +2" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows no +N avatar when the limit is not reached", () => {
    render(<AvatarGroup avatars={people} limit={4} />, { wrapper });
    expect(avatars()).toHaveLength(4);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("stacks later avatars on top by default and earlier ones with reverse", () => {
    const { rerender } = render(<AvatarGroup avatars={people} limit={3} />, { wrapper });
    expect(avatars().map((a) => a.style.zIndex)).toEqual(["1", "2", "3", "4"]);
    rerender(<AvatarGroup avatars={people} limit={3} reverse />);
    expect(avatars().map((a) => a.style.zIndex)).toEqual(["3", "2", "1", "-1"]);
  });

  it("passes the group size to every avatar and lets one override it", () => {
    render(<AvatarGroup avatars={[{ value: "AB" }, { value: "CD", size: 48 }]} size="l" />, {
      wrapper,
    });
    const [first, second] = avatars();
    expect(first.className).toMatch(/_l_/);
    expect(second.style.width).toBe("var(--static-space-48)");
  });

  it("keeps the group's own style on the group, not on the +N avatar", () => {
    const { container } = render(
      <AvatarGroup avatars={people} limit={1} style={{ marginTop: "7px" }} />,
      { wrapper },
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group.style.marginTop).toBe("7px");
    const plus = screen.getByRole("img", { name: "Avatar with initials +3" });
    expect(plus.style.marginTop).toBe("");
  });

  it("keeps an avatar's own style next to its z-index", () => {
    render(<AvatarGroup avatars={[{ value: "AB", style: { opacity: 0.4 } }]} />, { wrapper });
    const [only] = avatars();
    expect(only.style.opacity).toBe("0.4");
    expect(only.style.zIndex).toBe("1");
  });

  it("puts the avatars in the group root", () => {
    const { container } = render(<AvatarGroup avatars={people.slice(0, 2)} />, { wrapper });
    expect(within(container.firstElementChild as HTMLElement).getAllByRole("img")).toHaveLength(2);
  });
});
