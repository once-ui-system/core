import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Feedback } from "../components/Feedback";
import { Heading } from "../components/Heading";
import { IconButton } from "../components/IconButton";
import { Pulse } from "../components/Pulse";
import { StatusIndicator } from "../components/StatusIndicator";
import { Text } from "../components/Text";
import { Timeline } from "../components/Timeline";
import { Toast } from "../components/Toast";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * E1/E2: `tone` is the semantic palette and `variant` the appearance, on
 * every component that had them mixed. 2.x's `variant="danger"` is
 * `tone="danger"` on the default `primary` variant, `quaternary` is `ghost`,
 * and Text/Heading take `textVariant` like Flex.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const noop = () => {};

const classOf = (el: Element | null) => el?.className ?? "";

describe("Button and IconButton: variant is appearance, tone the palette", () => {
  it("draws primary in brand and the other variants in neutral by default", () => {
    render(
      <>
        <Button onClick={noop}>Primary</Button>
        <Button onClick={noop} variant="secondary">
          Secondary
        </Button>
        <Button onClick={noop} variant="ghost">
          Ghost
        </Button>
      </>,
      { wrapper },
    );
    expect(classOf(screen.getByRole("button", { name: "Primary" }))).toMatch(
      /_primary_.*_tone-brand_/,
    );
    expect(classOf(screen.getByRole("button", { name: "Secondary" }))).toMatch(/_tone-neutral_/);
    expect(classOf(screen.getByRole("button", { name: "Ghost" }))).toMatch(
      /_ghost_.*_tone-neutral_/,
    );
  });

  it("takes any tone on any variant", () => {
    render(
      <>
        <Button onClick={noop} tone="danger">
          Delete
        </Button>
        <Button onClick={noop} variant="tertiary" tone="success">
          Done
        </Button>
        <IconButton onClick={noop} icon="close" tone="warning" aria-label="Close" />
      </>,
      { wrapper },
    );
    const del = classOf(screen.getByRole("button", { name: "Delete" }));
    expect(del).toMatch(/_primary_/);
    expect(del).toMatch(/_tone-danger_/);
    expect(classOf(screen.getByRole("button", { name: "Done" }))).toMatch(
      /_tertiary_.*_tone-success_/,
    );
    expect(classOf(screen.getByRole("button", { name: "Close" }))).toMatch(/_tone-warning_/);
  });

  it("has no tone classes left among its variants", () => {
    render(
      <Button onClick={noop} variant="link">
        Link
      </Button>,
      { wrapper },
    );
    const cls = classOf(screen.getByRole("button", { name: "Link" }));
    expect(cls).not.toMatch(/_(danger|success|warning|quaternary)_/);
  });
});

describe("tone on the other components", () => {
  it("Feedback draws in its tone, info by default", () => {
    const { rerender } = render(<Feedback description="Saved" />, { wrapper });
    expect(classOf(screen.getByRole("alert"))).toMatch(/info-background-medium/);
    rerender(<Feedback tone="success" description="Saved" />);
    expect(classOf(screen.getByRole("alert"))).toMatch(/success-background-medium/);
  });

  it("Toast takes tone, and only a danger toast interrupts", () => {
    const { rerender } = render(<Toast tone="success">Saved</Toast>, { wrapper });
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<Toast tone="danger">Failed</Toast>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("Timeline items take tone; one with none is a step not reached", () => {
    const { container } = render(
      <Timeline items={[{ label: "Done", tone: "success" }, { label: "Next" }]} />,
      { wrapper },
    );
    expect(container.innerHTML).toMatch(/success-solid-strong/);
    expect(container.innerHTML).toMatch(/neutral-background-weak/);
  });

  it("Pulse takes tone", () => {
    const { container } = render(<Pulse tone="danger" />, { wrapper });
    expect(container.innerHTML).toMatch(/danger-solid-strong/);
  });
});

describe("scheme is a palette hue", () => {
  it("StatusIndicator takes scheme, and every size from xs to xl", () => {
    render(<StatusIndicator scheme="green" size="xl" />, { wrapper });
    const dot = screen.getByRole("img", { name: "green status indicator" });
    expect(dot.className).toMatch(/_green_/);
    expect(dot.className).toMatch(/_xl_/);
  });

  it("Avatar's status indicator takes scheme", () => {
    render(<Avatar value="AB" statusIndicator={{ scheme: "red" }} />, { wrapper });
    expect(screen.getByRole("img", { name: "Status: red" }).className).toMatch(/_red_/);
  });
});

describe("Text and Heading take textVariant", () => {
  it("applies the preset's classes", () => {
    render(
      <>
        <Text textVariant="body-strong-s">Body</Text>
        <Heading textVariant="display-default-l">Title</Heading>
      </>,
      { wrapper },
    );
    expect(screen.getByText("Body").className).toMatch(/font-body.*font-strong.*font-s/);
    expect(screen.getByText("Title").className).toMatch(/font-display.*font-default.*font-l/);
  });
});
