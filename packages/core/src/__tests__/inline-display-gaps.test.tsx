import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Accordion } from "../components/Accordion";
import { AccordionGroup } from "../components/AccordionGroup";
import { Logo } from "../components/Logo";
import { NavItem } from "../components/NavItem";
import { StatusIndicator } from "../components/StatusIndicator";
import { Tag } from "../components/Tag";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

/**
 * Gaps hit rebuilding a real product: a Tag (or 2.x's Badge, now Tag
 * variant="announce") could not sit in a sentence, StatusIndicator took only
 * palette names, a NavItem badge only a
 * number, an Accordion title only the heading font, and Logo only images.
 */
describe("Tag inside text, the announcement look too", () => {
  it('render only spans with as="span", so they are valid inside a <p>', async () => {
    const { container } = render(
      <p>
        Status <Tag as="span" prefixIcon="check" label="Beta" /> and{" "}
        <Tag as="span" variant="announce" label="New" arrow />
      </p>,
      { wrapper },
    );
    const p = container.querySelector("p") as HTMLElement;
    expect(p.querySelectorAll("div")).toHaveLength(0);
    expect(screen.getByText("Beta").closest("span.display-inline-flex")).not.toBeNull();
    expect(screen.getByText("New").closest(".display-inline-flex")?.tagName).toBe("SPAN");
    await expectNoAxeViolations(container);
  });

  it("keep the div by default", () => {
    const { container } = render(
      <>
        <Tag label="Beta" />
        <Tag variant="announce" label="New" arrow />
      </>,
      { wrapper },
    );
    expect(screen.getByText("Beta").closest("div")).not.toBeNull();
    expect(container.querySelectorAll("div.display-inline-flex")).toHaveLength(0);
  });
});

describe("StatusIndicator colours", () => {
  // 3.0: a theme role is `tone`, a palette name `scheme` (2.x's `color`).
  it("takes a role as tone and any palette name as scheme", async () => {
    const { container } = render(
      <>
        <StatusIndicator tone="danger" />
        <StatusIndicator tone="brand" />
        <StatusIndicator scheme="sand" />
        <StatusIndicator scheme="green" />
      </>,
      { wrapper },
    );
    const dots = container.querySelectorAll('[role="img"]');
    expect(dots).toHaveLength(4);
    expect(dots[0].className).toMatch(/danger/);
    expect(dots[0]).toHaveAttribute("aria-label", "danger status indicator");
    expect(dots[2].className).toMatch(/sand/);
    await expectNoAxeViolations(container);
  });
});

describe("NavItem badge", () => {
  it("prints a text badge as given and reads it as its text", async () => {
    const { container } = render(<NavItem href="/new" label="Reports" badge="New" />, {
      wrapper,
    });
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(container.querySelector('[aria-label$="unread"]')).toBeNull();
    expect(screen.getByRole("link")).toHaveAccessibleName(/Reports.*New/);
    await expectNoAxeViolations(container);
  });

  it("keeps a number a count: 9+ above 9, hidden at 0", () => {
    const { rerender } = render(<NavItem href="/a" label="Inbox" badge={12} />, { wrapper });
    expect(screen.getByText("9+")).toBeInTheDocument();
    expect(screen.getByLabelText("12 unread")).toBeInTheDocument();
    rerender(<NavItem href="/a" label="Inbox" badge={0} />);
    expect(screen.queryByText("0")).toBeNull();
    rerender(<NavItem href="/a" label="Inbox" badge="" />);
    expect(screen.getByRole("link")).toHaveAccessibleName("Inbox");
  });
});

describe("Accordion title variant and radius", () => {
  it("defaults the title to the heading font and follows titleVariant", async () => {
    const { container } = render(
      <AccordionGroup
        titleVariant="body-default-m"
        items={[
          { title: "Shipping", content: "Two days." },
          { title: "Returns", content: "Thirty days." },
        ]}
      />,
      { wrapper },
    );
    const title = screen.getByText("Shipping");
    expect(title.className).toMatch(/font-body/);
    expect(title.className).not.toMatch(/font-heading/);
    await expectNoAxeViolations(container);
  });

  it("keeps heading-strong-s by default and takes radius none", () => {
    render(
      <Accordion title="Plain" radius="none">
        Body
      </Accordion>,
      { wrapper },
    );
    const title = screen.getByText("Plain");
    expect(title.className).toMatch(/font-heading/);
    expect(screen.getByRole("button").className).toMatch(/radius-none/);
  });
});

describe("Logo text wordmark", () => {
  it("sets the name in the heading font beside the icon", async () => {
    const { container } = render(<Logo icon="/mark.svg" text="XESO" href="/" />, { wrapper });
    const word = screen.getByText("XESO");
    expect(word).toHaveClass("font-heading");
    expect(word.style.lineHeight).toBe("var(--static-space-32)");
    expect(screen.getByRole("link")).toHaveAccessibleName("XESO");
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    await expectNoAxeViolations(container);
  });

  it("renders text alone, sized to the logo", () => {
    render(<Logo text="XESO" size="l" />, { wrapper });
    expect(screen.getByText("XESO").style.lineHeight).toBe("var(--static-space-40)");
  });
});
