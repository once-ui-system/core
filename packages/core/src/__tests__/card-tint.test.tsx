import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "../components/Card";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** The surface: the Flex inside the link or button that carries the classes. */
const surfaceOf = (text: string) =>
  screen.getByText(text).closest("[class*='card']") as HTMLElement;
const layerOf = (surface: HTMLElement) =>
  surface.querySelector<HTMLElement>(":scope > [aria-hidden='true']");

describe("Card tint", () => {
  it("draws no tint layer unless asked", () => {
    render(<Card href="/a">Plain</Card>, { wrapper: wrap });
    expect(layerOf(surfaceOf("Plain"))).toBeNull();
  });

  it("tints a named hue through its own data-brand, not the card's", () => {
    render(
      <Card href="/aveiro" tint="cyan">
        Aveiro
      </Card>,
      { wrapper: wrap },
    );
    const surface = surfaceOf("Aveiro");
    expect(surface.className).toMatch(/tinted/);
    expect(surface).not.toHaveAttribute("data-brand");
    expect(layerOf(surface)).toHaveAttribute("data-brand", "cyan");
  });

  it("tints a tone by class", () => {
    render(
      <Card href="/ok" tint="success">
        Done
      </Card>,
      { wrapper: wrap },
    );
    const layer = layerOf(surfaceOf("Done"));
    expect(layer).not.toHaveAttribute("data-brand");
    expect(layer?.className).toMatch(/tint-success/);
  });

  it("shows selected through the tint, not the brand fill", () => {
    render(
      <Card onClick={() => {}} selected tint="magenta">
        Chosen
      </Card>,
      { wrapper: wrap },
    );
    const surface = surfaceOf("Chosen");
    expect(surface.className).not.toMatch(/brand-alpha-weak/);
    expect(surface.className).toMatch(/selected/);
    expect(layerOf(surface)).toHaveAttribute("data-brand", "magenta");
  });

  it("rejects neutral, which is the default hover already", () => {
    // @ts-expect-error — neutral is not a tint
    const card = <Card tint="neutral">x</Card>;
    expect(card).toBeTruthy();
  });
});
