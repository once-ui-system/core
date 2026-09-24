import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "../components/Card";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Card interactive element", () => {
  it("names the link, not the surface inside it", () => {
    render(
      <Card href="/projects/1" aria-label="Open Launch teaser">
        Thumbnail
      </Card>,
      { wrapper: wrap },
    );
    const link = screen.getByRole("link", { name: "Open Launch teaser" });
    expect(link).toHaveAttribute("href", "/projects/1");
    expect(screen.getByText("Thumbnail")).not.toHaveAttribute("aria-label");
  });

  it("names the button and forwards labelledby and describedby", () => {
    render(
      <Card onClick={() => {}} aria-labelledby="plan-name" aria-describedby="plan-price">
        Pro
      </Card>,
      { wrapper: wrap },
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-labelledby", "plan-name");
    expect(button).toHaveAttribute("aria-describedby", "plan-price");
  });

  it("fires onClick once per click on its content", () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Pro</Card>, { wrapper: wrap });
    fireEvent.click(screen.getByText("Pro"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("runs the handler of a link card once", () => {
    const onClick = vi.fn();
    render(
      <Card href="/projects/1" onClick={onClick}>
        Open
      </Card>,
      { wrapper: wrap },
    );
    fireEvent.click(screen.getByText("Open"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
