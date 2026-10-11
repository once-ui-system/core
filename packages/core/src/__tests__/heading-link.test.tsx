import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import { MdxHeading } from "../modules/mdx/MdxElements";
import { HeadingLink } from "../modules/navigation/HeadingLink";
import { expectNoAxeViolations } from "../test/axe";

/**
 * HeadingLink's copy control was a focusable `div` with a prohibited
 * `aria-label`, `inert` until the heading was hovered, and the component
 * threw without a ToastProvider. It now renders the anchor the `/mdx`
 * headings use: a real link to `#id`, always reachable, that copies the
 * section's URL with a toast when there is a provider and without one when
 * there is not.
 */

const Layout = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const WithToasts = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

const sectionUrl = (id: string) => `${window.location.origin}${window.location.pathname}#${id}`;

const stubClipboard = () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  return writeText;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HeadingLink", () => {
  it("renders the heading and a named link to it", () => {
    render(
      <HeadingLink as="h2" id="install">
        Install
      </HeadingLink>,
      { wrapper: Layout },
    );
    expect(screen.getByRole("heading", { level: 2, name: "Install" })).toHaveAttribute(
      "id",
      "install",
    );
    const link = screen.getByRole("link", { name: "Copy link to Install" });
    expect(link).toHaveAttribute("href", "#install");
    expect(link.closest("[inert]")).toBeNull();
  });

  it("has no axe violations, with or without a ToastProvider", async () => {
    const bare = render(
      <HeadingLink as="h2" id="install">
        Install
      </HeadingLink>,
      { wrapper: Layout },
    );
    await expectNoAxeViolations(bare.container);
    bare.unmount();

    const withToasts = render(
      <HeadingLink as="h3" id="usage">
        Usage
      </HeadingLink>,
      { wrapper: WithToasts },
    );
    await expectNoAxeViolations(withToasts.container);
  });

  it("is reachable by keyboard without hovering first", async () => {
    const user = userEvent.setup();
    render(
      <HeadingLink as="h2" id="install">
        Install
      </HeadingLink>,
      { wrapper: Layout },
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Copy link to Install" })).toHaveFocus();
  });

  it("copies without a ToastProvider, from the link or the heading, once each", () => {
    const writeText = stubClipboard();
    render(
      <HeadingLink as="h2" id="install">
        Install
      </HeadingLink>,
      { wrapper: Layout },
    );

    fireEvent.click(screen.getByRole("link", { name: "Copy link to Install" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenLastCalledWith(sectionUrl("install"));

    fireEvent.click(screen.getByRole("heading", { name: "Install" }));
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it("confirms with a toast when there is a ToastProvider", async () => {
    stubClipboard();
    render(
      <HeadingLink as="h2" id="install">
        Install
      </HeadingLink>,
      { wrapper: WithToasts },
    );
    fireEvent.click(screen.getByRole("link", { name: "Copy link to Install" }));
    expect(await screen.findByText("Link copied to clipboard.")).toBeInTheDocument();
  });

  it("keeps its own classes when given a className", () => {
    const { container } = render(
      <HeadingLink as="h2" id="install" className="custom">
        Install
      </HeadingLink>,
      { wrapper: Layout },
    );
    const row = container.querySelector(".custom");
    expect(row?.className).toMatch(/_control_/);
  });
});

describe("MdxHeading without a ToastProvider", () => {
  it("renders and copies through the same anchor", async () => {
    const writeText = stubClipboard();
    const { container } = render(<MdxHeading as="h2">Why overflow</MdxHeading>, {
      wrapper: Layout,
    });
    fireEvent.click(screen.getByRole("link", { name: "Copy link to Why overflow" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(sectionUrl("why-overflow")));
    await expectNoAxeViolations(container);
  });
});
