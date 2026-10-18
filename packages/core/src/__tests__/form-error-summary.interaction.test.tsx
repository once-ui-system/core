import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { FormErrorSummary } from "../components/FormErrorSummary";
import { Input } from "../components/Input";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * FormErrorSummary through failed submits: it takes focus when it appears
 * and again when the errors change (not on an unrelated re-render), its links
 * are reached with Tab and move focus into their field on Enter, an entry
 * whose field is missing follows its hash, and a field with two errors lists
 * both.
 */
describe("FormErrorSummary: interaction", () => {
  const Checkout = () => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [, rerender] = useState(0);
    return (
      <>
        <FormErrorSummary errors={errors} title="Fix 2 problems" />
        <Input id="email" label="Email" />
        <Input id="zip" label="ZIP" />
        <button
          type="button"
          onClick={() => setErrors({ email: "Enter an email", zip: "Enter a ZIP" })}
        >
          Submit
        </button>
        <button type="button" onClick={() => setErrors({ zip: "Enter a ZIP" })}>
          Submit again
        </button>
        <button type="button" onClick={() => rerender((n) => n + 1)}>
          Re-render
        </button>
      </>
    );
  };

  it("takes focus on a failed submit, and its links focus their fields from the keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(<Checkout />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Submit" }));
    const summary = screen.getByRole("alert");
    expect(summary).toHaveFocus();
    expect(summary).toHaveTextContent("Fix 2 problems");

    await user.tab();
    expect(screen.getByRole("link", { name: "Enter an email" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Enter a ZIP" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("textbox", { name: "ZIP" })).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("takes focus again when the errors change, but not on an unrelated re-render", async () => {
    const user = userEvent.setup();
    render(<Checkout />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await user.click(screen.getByRole("button", { name: "Re-render" }));
    expect(screen.getByRole("alert")).not.toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Submit again" }));
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("follows the hash of an entry whose field is not on the page", async () => {
    const user = userEvent.setup();
    render(<FormErrorSummary errors={{ missing: "Somewhere else" }} />, { wrapper: wrap });
    const link = screen.getByRole("link", { name: "Somewhere else" });
    expect(link).toHaveAttribute("href", "#missing");
    await user.click(link);
    expect(window.location.hash).toBe("#missing");
    window.location.hash = "";
  });

  // Two errors on one field shared the field id as their React key.
  it("lists two errors for the same field, without a key warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <>
        <FormErrorSummary
          errors={[
            { id: "password", message: "Too short" },
            { id: "password", message: "Needs a digit" },
          ]}
        />
        <Input id="password" label="Password" />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(error).not.toHaveBeenCalled();
  });

  it("renders plain text for an entry without an id", () => {
    render(<FormErrorSummary errors={[{ message: "Server unavailable" }]} />, { wrapper: wrap });
    expect(screen.getByRole("listitem")).toHaveTextContent("Server unavailable");
    expect(screen.queryByRole("link")).toBeNull();
  });
});
