import { render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { Checkbox } from "../components/Checkbox";
import { Dialog } from "../components/Dialog";
import { InteractiveDetails } from "../components/InteractiveDetails";
import { RadioButton } from "../components/RadioButton";
import { resetScrollLockState } from "../components/ScrollLock";
import { Skeleton } from "../components/Skeleton";
import { Switch } from "../components/Switch";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { resetDialogState } from "../test/dialogTestUtils";

/**
 * These components forwarded a ref at runtime but were declared
 * `React.FC<Props> = forwardRef(…)`, and the `React.FC` annotation dropped
 * `ref` from their public type: `<Checkbox ref={ref} />` worked and did not
 * compile. They are typed like the rest of the package now. The JSX below is
 * the type test — `pnpm typecheck` compiles this file.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("refs are part of the public type", () => {
  it("types each ref to the element it reaches", () => {
    expectTypeOf<React.ComponentProps<typeof Checkbox>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLInputElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof RadioButton>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLInputElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof Switch>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLInputElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof Dialog>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLDivElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof Skeleton>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLDivElement> | undefined
    >();
    expectTypeOf<React.ComponentProps<typeof InteractiveDetails>["ref"]>().toEqualTypeOf<
      React.Ref<HTMLDivElement> | undefined
    >();
  });

  it("hands Checkbox, RadioButton and Switch refs to the input that submits the value", () => {
    const checkbox = createRef<HTMLInputElement>();
    const radio = createRef<HTMLInputElement>();
    const toggle = createRef<HTMLInputElement>();
    render(
      <>
        <Checkbox ref={checkbox} name="terms" label="Terms" />
        <RadioButton ref={radio} name="plan" label="Monthly" />
        <Switch ref={toggle} name="wifi" label="Wi-Fi" />
      </>,
      { wrapper: wrap },
    );

    expect(checkbox.current).toBeInstanceOf(HTMLInputElement);
    expect(checkbox.current?.name).toBe("terms");
    expect(radio.current?.type).toBe("radio");
    expect(toggle.current?.name).toBe("wifi");
  });

  it("hands Skeleton and InteractiveDetails refs to their root element", () => {
    const skeleton = createRef<HTMLDivElement>();
    const details = createRef<HTMLDivElement>();
    render(
      <>
        <Skeleton ref={skeleton} shape="line" data-testid="skeleton" />
        <InteractiveDetails ref={details} label="Label" onClick={() => {}} />
      </>,
      { wrapper: wrap },
    );

    expect(skeleton.current).toBe(screen.getByTestId("skeleton"));
    expect(details.current).toContainElement(screen.getByText("Label"));
  });

  it("hands a Dialog ref to the dialog element", () => {
    resetScrollLockState();
    resetDialogState();
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog ref={ref} open onClose={vi.fn()} title="Settings">
        Body
      </Dialog>,
      { wrapper: wrap },
    );

    expect(ref.current).toBe(screen.getByRole("dialog"));
  });
});
