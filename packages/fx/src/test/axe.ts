import axe from "axe-core";
import { expect } from "vitest";

/**
 * Rules jsdom cannot judge: it computes no colours or layout, and a test renders
 * a fragment rather than a page with landmarks.
 */
const JSDOM_BLIND: axe.RunOptions["rules"] = {
  "color-contrast": { enabled: false },
  region: { enabled: false },
};

/** The axe violations in a rendered tree, one line each: rule, help text and the offending nodes. */
export async function axeViolations(
  container: Element,
  options: axe.RunOptions = {},
): Promise<string[]> {
  const results = await axe.run(container, {
    ...options,
    rules: { ...JSDOM_BLIND, ...options.rules },
  });
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes
        .map((node) => node.target.join(" "))
        .join(", ")})`,
  );
}

/** Fails the test with every axe violation in `container`. */
export async function expectNoAxeViolations(container: Element, options?: axe.RunOptions) {
  expect(await axeViolations(container, options)).toEqual([]);
}
