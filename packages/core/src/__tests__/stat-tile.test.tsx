import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { StatTile } from "../components/StatTile";
import { Tag } from "../components/Tag";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("StatTile", () => {
  it("shows the label, value, change and context", async () => {
    const { container } = render(
      <StatTile
        label="Open jobs"
        value="128"
        icon="check"
        hint="12 due today"
        delta={{ label: "−8%", direction: "down", tone: "success" }}
      />,
      { wrapper },
    );
    for (const text of ["Open jobs", "128", "12 due today", "−8%"]) {
      expect(screen.getByText(text)).toBeTruthy();
    }
    expect(container.querySelector("a")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("is a link with href, and a placeholder while loading", () => {
    render(<StatTile label="Revenue" value="€12.4k" href="/revenue" loading />, { wrapper });
    expect(screen.getByRole("link").getAttribute("href")).toBe("/revenue");
    expect(screen.queryByText("€12.4k")).toBeNull();
  });
});

describe("Tag solid", () => {
  it("fills the tag in its tone with no dot", () => {
    const { container } = render(<Tag variant="solid" tone="danger" label="Evacuate" />, {
      wrapper,
    });
    const tag = container.firstElementChild as HTMLElement;
    expect(tag.className).toMatch(/solid/);
    expect(tag.className).toMatch(/tone-danger/);
    expect(container.querySelector('[class*="dot"]')).toBeNull();
    expect(screen.getByText("Evacuate")).toBeTruthy();
  });
});
