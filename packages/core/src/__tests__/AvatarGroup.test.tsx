import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { AvatarGroup, avatarGroupVariants } from "../components/AvatarGroup";

describe("AvatarGroup", () => {
  const sampleAvatars = [
    { value: "A" },
    { value: "B" },
    { value: "C" },
    { value: "D" },
    { value: "E" },
  ];

  it("renders default avatar group with all avatars", () => {
    const { container } = render(<AvatarGroup avatars={sampleAvatars} />);
    const group = container.firstChild as HTMLElement;
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass("z-0");

    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars).toHaveLength(5);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();
  });

  it("applies negative margin classes to avatar items", () => {
    const { container } = render(<AvatarGroup avatars={sampleAvatars} />);
    const avatars = container.querySelectorAll('[role="img"]');
    for (const avatar of avatars) {
      expect(avatar).toHaveClass("first:ml-0", "-ml-8");
    }
  });

  it("calculates default zIndex stacking order (reverse = false)", () => {
    const { container } = render(<AvatarGroup avatars={sampleAvatars.slice(0, 3)} />);
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars[0]).toHaveStyle({ zIndex: "1" });
    expect(avatars[1]).toHaveStyle({ zIndex: "2" });
    expect(avatars[2]).toHaveStyle({ zIndex: "3" });
  });

  it("calculates reverse zIndex stacking order (reverse = true)", () => {
    const { container } = render(<AvatarGroup avatars={sampleAvatars.slice(0, 3)} reverse />);
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars[0]).toHaveStyle({ zIndex: "3" });
    expect(avatars[1]).toHaveStyle({ zIndex: "2" });
    expect(avatars[2]).toHaveStyle({ zIndex: "1" });
  });

  it("handles limit prop and displays remaining count indicator", () => {
    const { container } = render(<AvatarGroup avatars={sampleAvatars} limit={3} />);
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars).toHaveLength(4); // 3 displayed + 1 overflow count indicator
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.queryByText("D")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(avatars[3]).toHaveStyle({ zIndex: "4" });
  });

  it("handles limit prop with reverse = true", () => {
    const { container } = render(<AvatarGroup avatars={sampleAvatars} limit={3} reverse />);
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars).toHaveLength(4);
    expect(avatars[0]).toHaveStyle({ zIndex: "3" });
    expect(avatars[1]).toHaveStyle({ zIndex: "2" });
    expect(avatars[2]).toHaveStyle({ zIndex: "1" });
    expect(avatars[3]).toHaveStyle({ zIndex: "-1" });
  });

  it("does not show remaining count when limit >= avatars length", () => {
    const { container } = render(<AvatarGroup avatars={sampleAvatars} limit={5} />);
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars).toHaveLength(5);
    expect(screen.queryByText("+0")).not.toBeInTheDocument();
  });

  it("supports all TShirtSizes", () => {
    const sizes = ["xs", "s", "m", "l", "xl"] as const;
    const sizeClasses = {
      xs: "w-20",
      s: "w-24",
      m: "w-32",
      l: "w-48",
      xl: "w-160",
    };

    for (const size of sizes) {
      const { container } = render(
        <AvatarGroup avatars={[{ value: "A" }, { value: "B" }]} size={size} />,
      );
      const avatars = container.querySelectorAll('[role="img"]');
      for (const avatar of avatars) {
        expect(avatar).toHaveClass(sizeClasses[size]);
      }
    }
  });

  it("forwards ref to container div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AvatarGroup ref={ref} avatars={sampleAvatars} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <AvatarGroup
        avatars={sampleAvatars}
        className="custom-group-class"
        style={{ opacity: 0.9 }}
      />,
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("custom-group-class", "z-0");
    expect(group.style.opacity).toBe("0.9");
  });

  it("preserves individual avatar styles and classNames", () => {
    const { container } = render(
      <AvatarGroup
        avatars={[
          { value: "A", className: "custom-avatar-a", style: { opacity: 0.5 } },
          { value: "B" },
        ]}
      />,
    );
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars[0]).toHaveClass("custom-avatar-a", "first:ml-0", "-ml-8");
    expect((avatars[0] as HTMLElement).style.opacity).toBe("0.5");
  });

  it("exports avatarGroupVariants function", () => {
    expect(avatarGroupVariants()).toBe("z-0");
  });
});
