import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Option } from "../components/Option";
import { resetScrollLockState } from "../components/ScrollLock";
import { UserMenu, userMenuVariants } from "../components/UserMenu";
import { clearLastOpenedDropdown } from "../utils";

describe("UserMenu", () => {
  beforeEach(() => {
    resetScrollLockState();
    clearLastOpenedDropdown();
  });

  afterEach(() => {
    clearLastOpenedDropdown();
    vi.useRealTimers();
  });

  it("renders user details correctly", () => {
    render(<UserMenu name="Jane Doe" subline="Product Designer" avatarProps={{ value: "JD" }} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders unselected state by default with proper classes", () => {
    const { container } = render(<UserMenu name="Jane Doe" subline="Product Designer" />);

    const trigger = container.querySelector(".dropdown-trigger");
    expect(trigger).toBeInTheDocument();
    const column = trigger?.firstElementChild;
    expect(column).toHaveClass(
      "border-transparent",
      "bg-transparent",
      "rounded-full",
      "p-4",
      "cursor-interactive",
    );
  });

  it("renders selected state with selected classes", () => {
    const { container } = render(<UserMenu name="Jane Doe" selected={true} />);

    const trigger = container.querySelector(".dropdown-trigger");
    const column = trigger?.firstElementChild;
    expect(column).toHaveClass(
      "border-neutral-border-medium",
      "bg-neutral-background-strong",
      "selected",
    );
  });

  it("renders loading state with skeletons and disabled interactions", () => {
    const { container } = render(<UserMenu name="Jane Doe" subline="Designer" loading={true} />);

    const trigger = container.querySelector(".dropdown-trigger");
    const column = trigger?.firstElementChild;
    expect(column).toHaveClass("cursor-default", "pointer-events-none");
    expect(column).toHaveAttribute("tabindex", "-1");
  });

  it("opens dropdown on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <UserMenu
        name="Jane Doe"
        dropdown={
          <>
            <Option value="settings" label="Settings" />
            <Option value="logout" label="Log out" />
          </>
        }
      />,
    );

    expect(screen.queryByText("Settings")).not.toBeInTheDocument();

    const trigger = screen.getByText("Jane Doe");
    await user.click(trigger);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("forwards ref to the DropdownWrapper element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<UserMenu ref={ref} name="Jane Doe" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style on trigger column", () => {
    const { container } = render(
      <UserMenu name="Jane Doe" className="custom-user-menu" style={{ opacity: 0.8 }} />,
    );

    const trigger = container.querySelector(".dropdown-trigger");
    const column = trigger?.firstElementChild;
    expect(column).toHaveClass("custom-user-menu");
    expect((column as HTMLElement).style.opacity).toBe("0.8");
  });

  it("exports userMenuVariants for composability", () => {
    const selectedClasses = userMenuVariants({ selected: true });
    expect(selectedClasses).toContain("border-neutral-border-medium");
    expect(selectedClasses).toContain("bg-neutral-background-strong");
    expect(selectedClasses).toContain("hover:border-neutral-border-strong");

    const unselectedClasses = userMenuVariants({ selected: false });
    expect(unselectedClasses).toContain("border-transparent");
    expect(unselectedClasses).toContain("bg-transparent");
    expect(unselectedClasses).toContain("hover:border-neutral-alpha-medium");
    expect(unselectedClasses).toContain("hover:bg-neutral-alpha-weak");
  });
});
