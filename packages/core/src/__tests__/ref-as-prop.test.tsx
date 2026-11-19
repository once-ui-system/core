import { render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Column } from "../components/Column";
import { Flex } from "../components/Flex";
import { IconButton } from "../components/IconButton";
import { Input } from "../components/Input";
import { Text } from "../components/Text";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * 3.0 (B7): components take `ref` as an ordinary prop (React 19) instead of
 * going through `forwardRef`. The public types must still carry the ref, typed
 * by the element it reaches, and the ref must still land on that element —
 * not in `...rest`, where it would be spread onto the wrong node.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("ref as a prop", () => {
  it("keeps ref in the public props types", () => {
    expectTypeOf<React.ComponentProps<typeof Button>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLButtonElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof IconButton>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLButtonElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof Input>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLInputElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof Textarea>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLTextAreaElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof Card>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLDivElement> | undefined
    >();
    // `ComponentPropsWithoutRef` still strips it, and `ComponentRef` (and the
    // deprecated `ElementRef`) still name the element.
    expectTypeOf<React.ComponentPropsWithoutRef<typeof Button>>().not.toHaveProperty("ref");
    expectTypeOf<React.ComponentRef<typeof Button>>().toEqualTypeOf<HTMLButtonElement>();
    expectTypeOf<React.ElementRef<typeof Input>>().toEqualTypeOf<HTMLInputElement>();
    expectTypeOf<React.ComponentRef<typeof Card>>().toEqualTypeOf<HTMLDivElement>();
  });

  it("hands Button, IconButton, Input and Textarea refs to their native element", () => {
    const button = createRef<HTMLButtonElement>();
    const icon = createRef<HTMLButtonElement>();
    const input = createRef<HTMLInputElement>();
    const textarea = createRef<HTMLTextAreaElement>();
    render(
      <>
        <Button ref={button} onClick={() => {}}>
          Save
        </Button>
        <IconButton ref={icon} icon="close" aria-label="Close" onClick={() => {}} />
        <Input ref={input} id="email" label="Email" />
        <Textarea ref={textarea} id="bio" label="Bio" />
      </>,
      { wrapper: wrap },
    );

    expect(button.current).toBe(screen.getByRole("button", { name: "Save" }));
    expect(icon.current).toBe(screen.getByRole("button", { name: "Close" }));
    expect(input.current).toBeInstanceOf(HTMLInputElement);
    expect(input.current?.id).toBe("email");
    expect(textarea.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(textarea.current?.id).toBe("bio");
  });

  it("hands Card, Column, a polymorphic Flex and Text their element's ref", () => {
    const card = createRef<HTMLDivElement>();
    const column = createRef<HTMLDivElement>();
    const link = createRef<HTMLAnchorElement>();
    const text = createRef<HTMLLIElement>();
    render(
      <>
        <Card ref={card} data-testid="card">
          Card
        </Card>
        <Column ref={column} data-testid="column">
          Column
        </Column>
        <Flex as="a" href="/docs" ref={link}>
          Docs
        </Flex>
        <ul>
          <Text as="li" ref={text}>
            Item
          </Text>
        </ul>
      </>,
      { wrapper: wrap },
    );

    // Card's ref is its outer element; its own props go to the surface inside.
    expect(card.current).toContainElement(screen.getByTestId("card"));
    expect(column.current).toBe(screen.getByTestId("column"));
    expect(link.current).toBe(screen.getByRole("link", { name: "Docs" }));
    expect(text.current).toBe(screen.getByRole("listitem"));
    // The ref is taken out of the props, never written to the DOM.
    expect(card.current?.getAttribute("ref")).toBeNull();
    expect(screen.getByTestId("column").getAttribute("ref")).toBeNull();
  });

  it("calls a callback ref with the element", () => {
    let node: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(el) => {
          node = el;
        }}
        onClick={() => {}}
      >
        Go
      </Button>,
      { wrapper: wrap },
    );
    expect(node).toBe(screen.getByRole("button", { name: "Go" }));
  });
});
