import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Heading } from "../components/Heading";
import { Text } from "../components/Text";

/**
 * `<Text flex={1}>` was the most common typecheck slip in the token dry run:
 * a label that takes the free space in a Row. It is a real prop now, on Text
 * and Heading, and lands as inline flex instead of a DOM attribute.
 */
describe("Text and Heading flex", () => {
  it("sets flex from a number or a FlexValue string", () => {
    expect(renderToStaticMarkup(<Text flex={1}>a</Text>)).toContain('style="flex:1"');
    expect(renderToStaticMarkup(<Heading flex="2">a</Heading>)).toContain("flex:2");
    expect(renderToStaticMarkup(<Text flex={1}>a</Text>)).not.toContain(' flex="');
  });
});
