import { render } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "../components/Badge";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * Every Badge without an `id` got `id="badge"`, so two on a page shared it,
 * and each one's arrow followed hover on the first.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Badge id", () => {
  it("gives each badge its own id, and keeps one that is passed", () => {
    const { container } = render(
      <>
        <Badge title="One" arrow />
        <Badge title="Two" arrow />
        <Badge title="Three" id="three" />
      </>,
      { wrapper },
    );
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
    expect(ids).not.toContain("badge");
    expect(ids).toContain("three");
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter(Boolean)).toHaveLength(3);
  });
});
