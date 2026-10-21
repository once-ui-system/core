import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Heading } from "../components/Heading";
import { Text } from "../components/Text";

/**
 * `<Text flex={1}>` was the most common typecheck slip in the token dry run:
 * a label that takes the free space in a Row. It is a real prop, on Text and
 * Heading, and lands as Flex's `flex-n` class instead of a DOM attribute.
 */
describe("Text and Heading flex", () => {
  it("sets flex from a number or a FlexValue string", () => {
    expect(renderToStaticMarkup(<Text flex={1}>a</Text>)).toMatch(/class="[^"]*\bflex-1\b/);
    expect(renderToStaticMarkup(<Heading flex="2">a</Heading>)).toMatch(/class="[^"]*\bflex-2\b/);
    expect(renderToStaticMarkup(<Text flex={1}>a</Text>)).not.toContain(' flex="');
  });
});

describe("Text and Heading breakpoint hide", () => {
  it("hides from the breakpoint down, without leaking to the DOM", () => {
    const html = renderToStaticMarkup(<Text s={{ hide: true }}>a</Text>);
    expect(html).toContain("s-flex-hide");
    expect(html).not.toContain(' s="');
    expect(renderToStaticMarkup(<Heading m={{ hide: true }}>a</Heading>)).toContain("m-flex-hide");
    expect(renderToStaticMarkup(<Text s={{ hide: false }}>a</Text>)).not.toContain("flex-");
  });
});
