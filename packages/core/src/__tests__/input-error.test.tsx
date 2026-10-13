import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../components/Input";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Input's error state reaches assistive tech. `aria-invalid` used to follow
 * `errorMessage` only, so a field given `error` was drawn in the error state
 * but announced as valid; and the caller's own `aria-describedby` was
 * overwritten by the field's.
 */

const field = () => screen.getByRole("textbox", { name: "Email" });

describe("Input error state", () => {
  it("is invalid from `error` alone, with nothing to describe it", async () => {
    const { container } = render(<Input id="email" label="Email" error />);
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).not.toHaveAttribute("aria-describedby");
    await expectNoAxeViolations(container);
  });

  it("is invalid and described by its message", async () => {
    const { container } = render(
      <Input id="email" label="Email" error errorMessage="Enter a valid email" />,
    );
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).toHaveAttribute("aria-describedby", "email-error");
    expect(field()).toHaveAccessibleDescription("Enter a valid email");
    await expectNoAxeViolations(container);
  });

  it("is valid without `error` or a message", () => {
    render(<Input id="email" label="Email" />);
    expect(field()).toHaveAttribute("aria-invalid", "false");
    expect(field()).not.toHaveAttribute("aria-describedby");
  });

  it("keeps the caller's aria-describedby and adds its message", () => {
    render(
      <>
        <p id="hint">We never share it.</p>
        <Input
          id="email"
          label="Email"
          aria-describedby="hint"
          error
          errorMessage="Enter a valid email"
        />
      </>,
    );
    expect(field()).toHaveAttribute("aria-describedby", "hint email-error");
    expect(field()).toHaveAccessibleDescription("We never share it. Enter a valid email");
  });

  it("points at no message when `errorMessage` is false", () => {
    render(<Input id="email" label="Email" error errorMessage={false} />);
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).not.toHaveAttribute("aria-describedby");
  });
});
