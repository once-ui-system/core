import { render } from "@testing-library/react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Heading } from "../components/Heading";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { InlineCode } from "../components/InlineCode";
import { Input } from "../components/Input";
import { Kbd } from "../components/Kbd";
import { Logo } from "../components/Logo";
import { NavIcon } from "../components/NavIcon";
import { ProgressBar } from "../components/ProgressBar";
import { RadioButton } from "../components/RadioButton";
import { Select } from "../components/Select";
import { Slider } from "../components/Slider";
import { SmartLink } from "../components/SmartLink";
import { Spinner } from "../components/Spinner";
import { StatusIndicator } from "../components/StatusIndicator";
import { Switch } from "../components/Switch";
import { Text } from "../components/Text";
import { Textarea } from "../components/Textarea";
import { ToggleButton } from "../components/ToggleButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import type { LeafProps } from "../interfaces";
import { tokenLength as t } from "../utils/layoutClasses";

/**
 * 3.0 (G2): a leaf takes its own props and `LeafProps` — margins, `flex`,
 * `fillWidth`, `position` and the offsets, `className`, `style` — and the
 * element's attributes. Padding, background, border, radius, sizes, `hide`
 * and the `xl`…`xs` breakpoint objects are type errors: they belong on a
 * Row or Column around it.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

describe("LeafProps", () => {
  it("is the small set", () => {
    expectTypeOf<keyof LeafProps>().toEqualTypeOf<
      | "margin"
      | "marginTop"
      | "marginRight"
      | "marginBottom"
      | "marginLeft"
      | "marginX"
      | "marginY"
      | "flex"
      | "fillWidth"
      | "position"
      | "top"
      | "right"
      | "bottom"
      | "left"
      | "className"
      | "style"
    >();
  });

  it("types the dropped props out on every leaf", () => {
    const elements = (
      <>
        {/* @ts-expect-error — breakpoint objects: wrap it in a Row */}
        <Button s={{ fillWidth: true }}>Go</Button>
        {/* @ts-expect-error */}
        <Button padding="8">Go</Button>
        {/* @ts-expect-error */}
        <IconButton icon="close" aria-label="Close" hide />
        {/* @ts-expect-error */}
        <ToggleButton background="surface">A</ToggleButton>
        {/* @ts-expect-error */}
        <Text s={{ direction: "column" }}>a</Text>
        {/* @ts-expect-error */}
        <Text maxWidth={320}>a</Text>
        {/* @ts-expect-error */}
        <Heading paddingX="8">a</Heading>
        {/* @ts-expect-error */}
        <Text translateY="8">a</Text>
        {/* @ts-expect-error */}
        <Icon name="close" padding="8" />
        {/* @ts-expect-error */}
        <Icon name="close" radius="full" />
        {/* @ts-expect-error */}
        <Avatar s={{ hide: true }} />
        {/* @ts-expect-error */}
        <Avatar border="page" />
        {/* @ts-expect-error */}
        <Spinner minHeight={40} />
        {/* @ts-expect-error */}
        <StatusIndicator tone="success" opacity={60} />
        {/* @ts-expect-error */}
        <Kbd background="brand-medium">K</Kbd>
        {/* @ts-expect-error */}
        <InlineCode border="brand-medium">x</InlineCode>
        {/* @ts-expect-error */}
        <ProgressBar value={1} paddingX="16" />
        {/* @ts-expect-error */}
        <NavIcon m={{ hide: true }} />
        {/* @ts-expect-error */}
        <Input id="a" maxWidth={320} />
        {/* @ts-expect-error */}
        <Textarea id="b" padding="8" />
        {/* @ts-expect-error */}
        <Select id="c" options={[]} gap="8" />
        {/* @ts-expect-error */}
        <Switch zIndex={1} />
        {/* @ts-expect-error */}
        <Checkbox l={{ hide: true }} />
        {/* @ts-expect-error */}
        <RadioButton background="surface" />
        {/* @ts-expect-error */}
        <Slider padding="8" />
        {/* @ts-expect-error */}
        <SmartLink href="/" radius="m">
          a
        </SmartLink>
        {/* @ts-expect-error */}
        <Logo icon="/a.svg" xs={{ hide: true }} />
      </>
    );
    expect(elements).toBeTruthy();
  });

  it("types the kept props in on every leaf", () => {
    const elements = (
      <>
        <Button marginTop="8" flex={1} fillWidth position="relative" top={2}>
          Go
        </Button>
        <IconButton icon="close" aria-label="Close" marginLeft="auto" />
        <ToggleButton marginX="4">A</ToggleButton>
        <Text marginBottom="16" fillWidth>
          a
        </Text>
        <Heading marginTop="24">a</Heading>
        <Icon name="close" margin="4" />
        <Avatar position="absolute" bottom="0" left="0" />
        <Spinner marginY="8" />
        <Kbd marginLeft="4">K</Kbd>
        <Input id="a" marginTop="8" flex={1} />
        <Switch marginLeft="auto" />
        <Slider marginTop="16" />
        <Logo icon="/a.svg" marginRight="8" />
        <SmartLink href="/" fillWidth marginY="4">
          a
        </SmartLink>
      </>
    );
    expect(elements).toBeTruthy();
  });
});

describe("leaf props render on the leaf's own root", () => {
  it("Button: margin, flex and offsets as classes and inline values", () => {
    const { getByRole } = render(
      <Button onClick={() => {}} marginTop="8" marginLeft={4} flex={1} position="absolute" top="4">
        Go
      </Button>,
      { wrapper: wrap },
    );
    const el = getByRole("button");
    expect(el.className).toContain("mt-8");
    expect(el.className).toContain("flex-1");
    // Inline, so Button's own `position: relative` cannot win.
    expect(el.style.position).toBe("absolute");
    expect(el.className).toContain("top-4");
    // A step of the scale, which jsdom can compute (see Dialog.test).
    expect(el.style.marginLeft).toBe(t(4));
    expect(el.getAttribute("margintop")).toBeNull();
    expect(el.getAttribute("flex")).toBeNull();
  });

  it("IconButton and ToggleButton take them too", () => {
    const { getByLabelText, getByText } = render(
      <>
        <IconButton
          icon="close"
          aria-label="Close"
          marginLeft="auto"
          fillWidth
          onClick={() => {}}
        />
        <ToggleButton marginX="4" onClick={() => {}}>
          Toggle
        </ToggleButton>
      </>,
      { wrapper: wrap },
    );
    const icon = getByLabelText("Close");
    expect(icon.className).toContain("ml-auto");
    expect(icon.className).toContain("fill-width");
    expect(getByText("Toggle").closest("button")?.className).toContain("mx-4");
  });

  it("Input puts them on the field's root, not the <input>", () => {
    const { container } = render(<Input id="leaf-a" marginTop="8" flex={1} />, {
      wrapper: wrap,
    });
    const input = container.querySelector("input") as HTMLInputElement;
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("mt-8");
    expect(root.className).toContain("flex-1");
    expect(input.className).not.toContain("mt-8");
    expect(input.getAttribute("flex")).toBeNull();
  });

  it("Switch, Checkbox and RadioButton put them on the control's root", () => {
    const { container } = render(
      <>
        <Switch marginLeft="auto" aria-label="On" />
        <Checkbox marginTop="8" label="A" />
        <RadioButton marginBottom="8" label="B" />
      </>,
      { wrapper: wrap },
    );
    const roots = [...container.children] as HTMLElement[];
    expect(roots[0].className).toContain("ml-auto");
    expect(roots[1].className).toContain("mt-8");
    expect(roots[2].className).toContain("mb-8");
    for (const input of container.querySelectorAll("input")) {
      expect(input.className).not.toMatch(/\bm[tbl]-/);
    }
  });

  it("Flex-based leaves pass them to their root", () => {
    const { container } = render(
      <>
        <Icon name="close" marginRight="8" data-testid="icon" />
        <Avatar position="absolute" bottom="0" value="A" />
        <Kbd marginLeft="4">K</Kbd>
      </>,
      { wrapper: wrap },
    );
    const icon = container.querySelector('[data-testid="icon"]') as HTMLElement;
    expect(icon.className).toContain("mr-8");
    expect(container.innerHTML).toContain("position-absolute");
    expect(container.innerHTML).toContain("bottom-0");
    expect((container.querySelector("kbd") as HTMLElement).className).toContain("ml-4");
  });

  it("Logo and SmartLink take them, and a margin replaces the link's own side margin", () => {
    const { container } = render(
      <>
        <Logo icon="/a.svg" marginRight="8" />
        <SmartLink href="/a" marginX="16">
          a
        </SmartLink>
        <SmartLink href="/b">b</SmartLink>
      </>,
      { wrapper: wrap },
    );
    expect(container.innerHTML).toContain("mr-8");
    const [first, second] = [...container.querySelectorAll("a")].slice(-2);
    expect(first.className).toContain("mx-16");
    expect(first.className).not.toContain("mx-2");
    expect(second.className).toContain("mx-2");
  });

  it("Slider puts them on its root, not the range input", () => {
    const { container } = render(<Slider marginTop="16" aria-label="Volume" />, {
      wrapper: wrap,
    });
    expect((container.firstElementChild as HTMLElement).className).toContain("mt-16");
    expect((container.querySelector("input") as HTMLElement).className).not.toContain("mt-16");
  });
});
