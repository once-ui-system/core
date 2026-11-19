/**
 * Findings from migrating a real Vite SPA onto 3.0.0-beta.1
 * (/mnt/project-files/3.0/adopters/barberdepo-migration.md, items 5 and 6).
 */
import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Button types", () => {
  it("renders a real button for type=reset and for a form attribute", () => {
    render(
      <>
        <Button type="reset">Clear</Button>
        <Button form="edit">Save</Button>
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button", { name: "Clear" })).toHaveAttribute("type", "reset");
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("form", "edit");
  });

  it("types an inline onClick's event under strict, on Button and IconButton", () => {
    const seen = vi.fn();
    render(
      <>
        <Button
          onClick={(event) => {
            event.stopPropagation();
            seen(event.currentTarget.tagName);
          }}
        >
          Go
        </Button>
        <IconButton icon="close" aria-label="Close" onClick={(event) => seen(event.button)} />
      </>,
      { wrapper: wrap },
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(seen).toHaveBeenNthCalledWith(1, "BUTTON");
    expect(seen).toHaveBeenNthCalledWith(2, 0);
  });

  it("warns in development when a typeless Button sits in a form", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
    try {
      render(
        <form>
          <Button>Save</Button>
        </form>,
        { wrapper: wrap },
      );
      expect(warn.mock.calls.flat().join(" ")).toMatch(/inside a <form>.*type="submit"/);
    } finally {
      vi.unstubAllEnvs();
      warn.mockRestore();
    }
  });
});
