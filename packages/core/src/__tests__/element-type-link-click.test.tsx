import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { ElementType } from "../components/ElementType";
import { IconButton } from "../components/IconButton";
import { SmartLink } from "../components/SmartLink";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { MobileMegaMenu } from "../modules/navigation/MobileMegaMenu";

/**
 * A link runs the `onClick` it is given. ElementType passed `onClick` only to
 * the button it renders without an `href`; with one, the anchor got
 * `onLinkClick` alone, so every Button, IconButton, SmartLink and Option with
 * an `href` silently dropped its handler.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

// jsdom implements no navigation; keep the click from attempting one.
const clickWithoutNavigating = (element: HTMLElement) => {
  element.addEventListener("click", (event) => event.preventDefault(), { once: true });
  fireEvent.click(element);
};

describe("ElementType link clicks", () => {
  it.each([
    ["an internal", "/about"],
    ["an external", "https://example.com"],
  ])("runs onClick, then onLinkClick, on %s link", (_kind, href) => {
    const calls: string[] = [];
    let target: EventTarget | null = null;
    render(
      <ElementType
        href={href}
        onClick={(event: React.MouseEvent) => {
          calls.push("onClick");
          target = event.currentTarget;
        }}
        onLinkClick={() => calls.push("onLinkClick")}
      >
        Go
      </ElementType>,
      { wrapper },
    );
    const link = screen.getByRole("link", { name: "Go" });
    clickWithoutNavigating(link);
    expect(calls).toEqual(["onClick", "onLinkClick"]);
    expect(target).toBe(link);
  });

  it("lets onClick cancel the navigation", () => {
    render(
      <ElementType href="/about" onClick={(event: React.MouseEvent) => event.preventDefault()}>
        Go
      </ElementType>,
      { wrapper },
    );
    // `fireEvent` returns false when a handler called preventDefault().
    expect(fireEvent.click(screen.getByRole("link", { name: "Go" }))).toBe(false);
  });

  it("runs the handler of a Button, IconButton and SmartLink with an href", () => {
    const onClick = vi.fn();
    render(
      <>
        <Button href="/a" onClick={onClick}>
          Button
        </Button>
        <IconButton href="/b" icon="close" aria-label="Icon" onClick={onClick} />
        <SmartLink href="/c" onClick={onClick}>
          Smart
        </SmartLink>
      </>,
      { wrapper },
    );
    for (const name of ["Button", "Icon", "Smart"]) {
      clickWithoutNavigating(screen.getByRole("link", { name }));
    }
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("closes MobileMegaMenu when one of its section links is followed", () => {
    const onClose = vi.fn();
    render(
      <MobileMegaMenu
        onClose={onClose}
        menuGroups={[
          {
            id: "docs",
            label: "Docs",
            sections: [{ links: [{ label: "Install", href: "/install" }] }],
          },
        ]}
      />,
      { wrapper },
    );
    // Option renders the link with role="option".
    clickWithoutNavigating(screen.getByText("Install").closest("a") as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
