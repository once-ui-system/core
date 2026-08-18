import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PasswordInput } from "../components/PasswordInput";

describe("PasswordInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with type='password' by default and forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <PasswordInput
        ref={ref}
        id="test-pwd"
        placeholder="Enter password"
        defaultValue="secret123"
      />,
    );

    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
    expect(ref.current).toBe(input);
  });

  it("toggles password visibility between 'password' and 'text'", () => {
    render(<PasswordInput id="toggle-pwd" placeholder="Password" />);

    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: "Show password" });
    fireEvent.click(toggleBtn);

    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute("type", "password");
  });
});
