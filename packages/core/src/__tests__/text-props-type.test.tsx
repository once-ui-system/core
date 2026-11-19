import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Heading, type HeadingProps } from "../components/Heading";
import { Text } from "../components/Text";
import type { TextProps } from "../interfaces";

/**
 * 3.0: `TextProps` is what a component that hands its props on to Text or
 * Heading types them with. The Next MDX-components pattern
 * (`(props: TextProps) => <Text {...props} />`, `({ children }: TextProps)`)
 * compiles as in 2.x: it carries `children` and the HTML attributes. It keeps
 * 3.0's leaf prop set (no padding) and Text's typed `as`.
 */
const Paragraph = (props: TextProps) => <Text {...props} />;

function createParagraph({ children, ...rest }: TextProps) {
  return (
    <Text textVariant="body-default-l" {...rest}>
      {children}
    </Text>
  );
}

function createHeading(as: "h1" | "h2" | "h3") {
  const CustomHeading = ({ children, ...props }: TextProps<typeof as>) => (
    <Heading as={as} {...props}>
      {children}
    </Heading>
  );
  return CustomHeading;
}

const Title = (props: HeadingProps) => <Heading {...props} />;

describe("TextProps", () => {
  it("carries children, className, style, the HTML attributes and the leaf props", () => {
    expectTypeOf<TextProps["children"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<TextProps>().toHaveProperty("id");
    expectTypeOf<TextProps>().toHaveProperty("onClick");
    expectTypeOf<TextProps>().toHaveProperty("aria-label");
    expectTypeOf<TextProps>().toHaveProperty("title");
    expectTypeOf<TextProps>().toHaveProperty("marginTop");
    expectTypeOf<TextProps>().toHaveProperty("textVariant");
    expectTypeOf<TextProps>().toHaveProperty("opacity");
    // G2: padding is a Column's around the text, not Text's.
    expectTypeOf<TextProps>().not.toHaveProperty("padding");
    expectTypeOf<TextProps>().not.toHaveProperty("paddingX");
    expectTypeOf<TextProps>().not.toHaveProperty("hide");
    expectTypeOf<HeadingProps>().toHaveProperty("children");
    expectTypeOf<HeadingProps<"h2">>().toHaveProperty("id");
  });

  it("renders the MDX-components pattern", () => {
    const H2 = createHeading("h2");
    const { container } = render(
      <>
        <Paragraph id="p" onBackground="neutral-weak">
          Body
        </Paragraph>
        {createParagraph({ children: "Made", className: "lead" })}
        <H2 id="intro">Intro</H2>
        <Title textVariant="display-strong-s">Title</Title>
      </>,
    );
    expect(container.querySelector("span#p")?.textContent).toBe("Body");
    expect(container.querySelector("span.lead")?.textContent).toBe("Made");
    expect(container.querySelector("h2#intro")?.textContent).toBe("Intro");
    expect(container.querySelector("h1")?.textContent).toBe("Title");
  });

  it("keeps `as` typed by the element on Text itself", () => {
    render(
      <>
        <Text as="a" href="/x">
          Link
        </Text>
        {/* @ts-expect-error — a span has no href */}
        <Text href="/x">Not a link</Text>
        {/* @ts-expect-error — padding goes on a Column around the text */}
        <Text padding="8">Padded</Text>
      </>,
    );
  });
});
