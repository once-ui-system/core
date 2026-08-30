import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, Effect, Media, Setting, SettingAxes, SettingGroup } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Card selected", () => {
  it("paints border and background from the brand scheme", () => {
    render(<Card selected>Pro</Card>, { wrapper: wrap });
    const surface = screen.getByText("Pro");
    expect(surface.className).toContain("brand-background-alpha-weak");
    expect(surface.className).toContain("brand-border-medium");
  });

  it("keeps the neutral surface when not selected", () => {
    render(<Card>Pro</Card>, { wrapper: wrap });
    const surface = screen.getByText("Pro");
    expect(surface.className).toContain("surface-background");
    expect(surface.className).not.toContain("brand");
  });

  it("announces a clickable selected card as a pressed toggle", () => {
    render(
      <Card selected onClick={() => {}}>
        Pro
      </Card>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("announces an unselected clickable card as not pressed", () => {
    render(
      <Card selected={false} onClick={() => {}}>
        Pro
      </Card>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("does not claim toggle semantics on a card nobody can operate", () => {
    const { container } = render(<Card selected>Pro</Card>, { wrapper: wrap });
    expect(container.querySelector("[aria-pressed]")).toBeNull();
  });

  it("lets an explicit background override the selected default", () => {
    render(
      <Card selected background="surface">
        Pro
      </Card>,
      { wrapper: wrap },
    );
    expect(screen.getByText("Pro").className).toContain("surface-background");
  });
});

describe("Effect", () => {
  it("renders its content with no layer when switched off", () => {
    const { container } = render(<Effect type="none">Hero</Effect>, { wrapper: wrap });
    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("paints a canvas layer for a canvas-backed effect", () => {
    const { container } = render(<Effect type="matrix">Hero</Effect>, { wrapper: wrap });
    expect(container.querySelector("canvas")).not.toBeNull();
    expect(screen.getByText("Hero")).toBeInTheDocument();
  });

  it("keeps the content in place across a swap — that is the point", () => {
    const { container, rerender } = render(<Effect type="matrix">Hero</Effect>, { wrapper: wrap });
    const before = container.firstElementChild?.className;
    rerender(
      <LayoutProvider>
        <Effect type="blob">Hero</Effect>
      </LayoutProvider>,
    );
    expect(container.firstElementChild?.className).toBe(before);
    expect(screen.getByText("Hero")).toBeInTheDocument();
  });
});

describe("Setting", () => {
  it("renders the label, description and control together", () => {
    render(
      <Setting label="Autoplay" description="Start on load">
        <button type="button">on</button>
      </Setting>,
      { wrapper: wrap },
    );
    expect(screen.getByText("Autoplay")).toBeInTheDocument();
    expect(screen.getByText("Start on load")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "on" })).toBeInTheDocument();
  });

  it("hides a group's body until it is open", () => {
    const { rerender } = render(
      <SettingGroup label="Watermark" control={<span>toggle</span>}>
        <Setting label="Opacity" />
      </SettingGroup>,
      { wrapper: wrap },
    );
    expect(screen.queryByText("Opacity")).toBeNull();
    rerender(
      <LayoutProvider>
        <SettingGroup label="Watermark" control={<span>toggle</span>} open>
          <Setting label="Opacity" />
        </SettingGroup>
      </LayoutProvider>,
    );
    expect(screen.getByText("Opacity")).toBeInTheDocument();
  });

  it("renders one row per axis", () => {
    render(
      <SettingAxes
        label="Tilt"
        axes={[
          { label: "X", control: <span>x-control</span> },
          { label: "Y", control: <span>y-control</span> },
        ]}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByText("x-control")).toBeInTheDocument();
    expect(screen.getByText("y-control")).toBeInTheDocument();
  });
});

describe("Media fill/stretch", () => {
  it("treats fill as the layout prop it is everywhere else", () => {
    const { container } = render(<Media src="/a.jpg" alt="a" fill />, { wrapper: wrap });
    expect(container.firstElementChild?.className).toContain("fill");
  });

  it("honours fillWidth={false}", () => {
    const { container } = render(<Media src="/a.jpg" alt="a" fillWidth={false} />, {
      wrapper: wrap,
    });
    expect(container.firstElementChild?.className).not.toContain("fill-width");
  });
});
