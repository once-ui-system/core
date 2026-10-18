import { LayoutProvider } from "@once-ui-system/core";
import { render } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { TypeFx } from "../TypeFx.js";

/** The October 2026 accessibility drill: text effects read as their words, not their frames. */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("text effects for a screen reader", () => {
  it("reads TypeFx's words whole, not letter by letter", () => {
    const { container } = render(<TypeFx words={["websites", "apps"]} trigger="custom" />, {
      wrapper: wrap,
    });
    expect(container).toHaveTextContent("websites, apps");
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
