import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Scrubber } from "../components/Scrubber";
import { Spinner } from "../components/Spinner";
import { StatusIndicator } from "../components/StatusIndicator";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Native `aria-label` is accepted alongside `ariaLabel` and lands on the
 * element that is named (ROADMAP W3). It used to fall through to an outer
 * wrapper with no role, where it named nothing. Switch is covered in its own
 * suite.
 */
describe("native aria-label alongside ariaLabel", () => {
  describe("Spinner", () => {
    it("keeps its default name and takes ariaLabel", async () => {
      const { container, rerender } = render(<Spinner />, { wrapper: wrap });
      expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
      await expectNoAxeViolations(container);

      rerender(<Spinner ariaLabel="Saving" />);
      expect(screen.getByRole("status", { name: "Saving" })).toBeInTheDocument();
    });

    it("puts native aria-label on the status element, winning over ariaLabel", async () => {
      const { container } = render(<Spinner aria-label="Uploading" ariaLabel="Saving" />, {
        wrapper: wrap,
      });
      expect(screen.getByRole("status", { name: "Uploading" })).toBeInTheDocument();
      expect(container.querySelectorAll("[aria-label]")).toHaveLength(1);
      await expectNoAxeViolations(container);
    });
  });

  describe("StatusIndicator", () => {
    it("is an image named by its default label", async () => {
      const { container } = render(<StatusIndicator color="green" />, { wrapper: wrap });
      expect(screen.getByRole("img", { name: "green status indicator" })).toBeInTheDocument();
      await expectNoAxeViolations(container);
    });

    it("takes native aria-label, winning over ariaLabel", async () => {
      const { container } = render(
        <StatusIndicator color="red" aria-label="Offline" ariaLabel="Red dot" />,
        { wrapper: wrap },
      );
      expect(screen.getByRole("img", { name: "Offline" })).toBeInTheDocument();
      await expectNoAxeViolations(container);
    });
  });

  describe("Scrubber", () => {
    it("names the slider, by default and with ariaLabel", () => {
      const { rerender } = render(<Scrubber duration={1000} value={0} onChange={() => {}} />, {
        wrapper: wrap,
      });
      expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();

      rerender(<Scrubber duration={1000} value={0} onChange={() => {}} ariaLabel="Playhead" />);
      expect(screen.getByRole("slider", { name: "Playhead" })).toBeInTheDocument();
    });

    it("puts native aria-label on the slider, winning over ariaLabel", async () => {
      const { container } = render(
        <Scrubber
          duration={1000}
          value={0}
          onChange={() => {}}
          aria-label="Clip position"
          ariaLabel="Playhead"
        />,
        { wrapper: wrap },
      );
      expect(screen.getByRole("slider", { name: "Clip position" })).toBeInTheDocument();
      expect(container.querySelectorAll("[aria-label]")).toHaveLength(1);
      await expectNoAxeViolations(container);
    });
  });
});
