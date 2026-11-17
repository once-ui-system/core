import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "../components/Drawer";
import { HeaderMenu } from "../components/HeaderMenu";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Page = (props: Partial<React.ComponentProps<typeof HeaderMenu>>) => (
  <div data-style-scope="brand" data-brand="custom">
    <header>
      <HeaderMenu below={false} footer={<a href="/signup">Sign up</a>} {...props}>
        <a href="/pricing">Pricing</a>
        <a href="/docs">Docs</a>
      </HeaderMenu>
    </header>
  </div>
);

const flush = () => act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));

describe("HeaderMenu", () => {
  it("opens a panel under the header and moves focus into it", async () => {
    const user = userEvent.setup();
    render(<Page />, { wrapper });
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    await flush();
    expect(button).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByRole("region", { name: "Menu" });
    expect(button).toHaveAttribute("aria-controls", panel.id);
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveFocus();
    expect(screen.getByRole("link", { name: "Sign up" }).closest("footer")).not.toBeNull();
  });

  it("keeps the button in place: the same element is the cross", async () => {
    const user = userEvent.setup();
    render(<Page />, { wrapper });
    const button = screen.getByRole("button", { name: "Menu" });
    await user.click(button);
    expect(screen.getAllByRole("button", { name: "Menu" })).toEqual([button]);
  });

  it("closes on Escape with focus back on the button, and on a link", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Page onOpenChange={onOpenChange} />, { wrapper });
    const button = screen.getByRole("button", { name: "Menu" });
    await user.click(button);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("region")).toBeNull();
    expect(button).toHaveFocus();
    await user.click(button);
    await user.click(screen.getByRole("link", { name: "Docs" }));
    expect(screen.queryByRole("region")).toBeNull();
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false, true, false]);
  });

  it("wraps Tab from the end of the menu back to the button", async () => {
    const user = userEvent.setup();
    render(<Page />, { wrapper });
    const button = screen.getByRole("button", { name: "Menu" });
    await user.click(button);
    await flush();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveFocus();
    await user.tab();
    expect(button).toHaveFocus();
  });

  it("keeps the StyleScope's look in the portal", async () => {
    const user = userEvent.setup();
    render(<Page />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const panel = screen.getByRole("region", { name: "Menu" });
    expect(panel).toHaveAttribute("data-style-scope", "brand");
    expect(panel).toHaveAttribute("data-brand", "custom");
  });
});

describe("Drawer in a StyleScope", () => {
  it("carries the scope's attributes onto its portal", () => {
    render(
      <div data-style-scope="app" data-neutral="sand">
        <Drawer open onClose={() => {}} title="Menu">
          <a href="/">Home</a>
        </Drawer>
      </div>,
      { wrapper },
    );
    const overlay = screen.getByRole("dialog").parentElement;
    expect(overlay).toHaveAttribute("data-style-scope", "app");
    expect(overlay).toHaveAttribute("data-neutral", "sand");
  });
});
