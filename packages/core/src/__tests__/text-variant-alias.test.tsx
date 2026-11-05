import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "../components/Heading";
import { Text } from "../components/Text";

describe("2.x variant on Text and Heading", () => {
  it("applies the same classes as textVariant", () => {
    const { container } = render(
      <>
        <Text textVariant="body-strong-s">a</Text>
        <Text variant="body-strong-s">b</Text>
        <Heading variant="display-strong-m">c</Heading>
        <Heading textVariant="display-strong-m">d</Heading>
      </>,
    );
    const [a, b, c, d] = Array.from(container.children);
    expect(b.className).toBe(a.className);
    expect(c.className).toBe(d.className);
    expect(b.hasAttribute("variant")).toBe(false);
  });
});
