import { render } from "@testing-library/react";
import { type ComponentProps, createRef, type Ref } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Heading } from "../components/Heading";
import { ListItem } from "../components/ListItem";
import { ShineFx } from "../components/ShineFx";
import { Text } from "../components/Text";
import { TypeFx } from "../components/TypeFx";

/**
 * `Text` and `Heading` took no ref, so `ListItem`, which declares
 * `forwardRef<HTMLLIElement>` and renders `<Text as="li">`, had nowhere to
 * send its own and dropped it. Both forward a ref now, typed to the element
 * `as` names, and stay generic over `as`: every call site that compiled
 * before compiles the same way. The JSX below is the type test — `pnpm
 * typecheck` compiles this file, and each `@ts-expect-error` fails it if the
 * line ever stops being an error.
 */
describe("Text and Heading refs", () => {
  it("types the ref to the element as names", () => {
    const span = createRef<HTMLSpanElement>();
    const li = createRef<HTMLLIElement>();
    const h1 = createRef<HTMLHeadingElement>();
    const anchor = createRef<HTMLAnchorElement>();
    const input = createRef<HTMLInputElement>();
    const elements = (
      <>
        <Text ref={span}>default span</Text>
        <Text as="li" ref={li}>
          item
        </Text>
        <Text as="a" href="/" ref={anchor}>
          link
        </Text>
        <Text
          as="li"
          ref={(el) => {
            expectTypeOf(el).toEqualTypeOf<HTMLLIElement | null>();
          }}
        >
          callback
        </Text>
        <Heading ref={h1}>default h1</Heading>
        <Heading as="h2" ref={h1}>
          h2
        </Heading>
        <ListItem ref={li}>list item</ListItem>
        {/* @ts-expect-error an input ref is not an li ref */}
        <Text as="li" ref={input}>
          wrong ref
        </Text>
        {/* @ts-expect-error `as` still decides the attributes: a span has no href */}
        <Text href="/">no href on a span</Text>
      </>
    );
    expect(elements).toBeTruthy();
  });

  it("keeps the props a wrapper extends", () => {
    // ListItem, ShineFx, TypeFx, CountFx and FadingLettersFx extend
    // `ComponentProps<typeof Text>`; it still carries every Text prop.
    type Props = ComponentProps<typeof Text>;
    expectTypeOf<Props>().toHaveProperty("as");
    expectTypeOf<Props>().toHaveProperty("textVariant");
    expectTypeOf<Props>().toHaveProperty("translateX");
    expectTypeOf<Props>().toHaveProperty("onBackground");
    expectTypeOf<ComponentProps<typeof ListItem>["ref"]>().toEqualTypeOf<
      Ref<HTMLLIElement> | undefined
    >();
  });

  it("hands the ref to the element it renders", () => {
    const span = createRef<HTMLSpanElement>();
    const li = createRef<HTMLLIElement>();
    const h1 = createRef<HTMLHeadingElement>();
    const h3 = createRef<HTMLHeadingElement>();
    render(
      <>
        <Text ref={span} data-testid="span">
          a
        </Text>
        <ul>
          <Text as="li" ref={li}>
            b
          </Text>
        </ul>
        <Heading ref={h1}>c</Heading>
        <Heading as="h3" ref={h3}>
          d
        </Heading>
      </>,
    );
    expect(span.current).toBeInstanceOf(HTMLSpanElement);
    expect(span.current?.textContent).toBe("a");
    expect(li.current?.tagName).toBe("LI");
    expect(h1.current?.tagName).toBe("H1");
    expect(h3.current?.tagName).toBe("H3");
  });

  it("passes ListItem's ref through to its li", () => {
    const li = createRef<HTMLLIElement>();
    const { container } = render(
      <ul>
        <ListItem ref={li} className="custom">
          item
        </ListItem>
      </ul>,
    );
    expect(li.current).toBe(container.querySelector("li"));
    expect(li.current?.classList.contains("custom")).toBe(true);
  });

  it("renders on the server with a ref, and writes no ref attribute", () => {
    const html = renderToStaticMarkup(
      <ul>
        <Text ref={createRef<HTMLSpanElement>()}>a</Text>
        <Heading as="h2" ref={createRef<HTMLHeadingElement>()}>
          b
        </Heading>
        <ListItem ref={createRef<HTMLLIElement>()}>c</ListItem>
      </ul>,
    );
    expect(html).toContain("<span");
    expect(html).toContain("<h2");
    expect(html).toContain("<li");
    expect(html).not.toMatch(/\sref=/);
  });

  it("keeps its display name", () => {
    expect(Text.displayName).toBe("Text");
    expect(Heading.displayName).toBe("Heading");
    expect(ListItem.displayName).toBe("ListItem");
  });

  it("passes ShineFx's and TypeFx's refs through to their text", () => {
    const shine = createRef<HTMLSpanElement>();
    const type = createRef<HTMLSpanElement>();
    render(
      <>
        <ShineFx ref={shine}>shine</ShineFx>
        <TypeFx ref={type} words={["typed"]} />
      </>,
    );
    expect(shine.current?.textContent).toBe("shine");
    expect(type.current).toBeInstanceOf(HTMLElement);
  });
});
