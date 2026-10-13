import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Column } from "../components/Column";
import { DropdownWrapper } from "../components/DropdownWrapper";
import { IconButton } from "../components/IconButton";
import { Option } from "../components/Option";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const menu = (
  <Column padding="4" gap="2">
    <Option value="rename" label="Rename" />
    <Option value="delete" label="Delete" />
  </Column>
);

/** Long enough for the dropdown's deferred focus hand-offs to have run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 120));

/**
 * A Button or IconButton with neither `onClick` nor `href` renders a div
 * (ElementType). That is right where it decorates something else that is the
 * control, and wrong as a DropdownWrapper trigger: nothing could Tab to it,
 * so the dropdown only opened with a mouse. Apps worked around it with
 * `type="button"` (Shorty's Picker).
 */
describe("a Button as a dropdown trigger", () => {
  it("is a real, focusable button that says what it opens", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <DropdownWrapper trigger={<Button variant="secondary">Options</Button>} dropdown={menu} />
      </>,
      { wrapper: wrap },
    );

    const trigger = screen.getByRole("button", { name: "Options" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    screen.getByRole("button", { name: "Before" }).focus();
    await user.tab();
    expect(trigger).toHaveFocus();
  });

  it("opens with Enter, closes with Escape and gets focus back", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper trigger={<Button>Options</Button>} dropdown={menu} />, {
      wrapper: wrap,
    });

    const trigger = screen.getByRole("button", { name: "Options" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    expect(await screen.findByRole("option", { name: "Rename" })).toBeInTheDocument();
    await settle();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("opens with Space", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper trigger={<Button>Options</Button>} dropdown={menu} />, {
      wrapper: wrap,
    });

    const trigger = screen.getByRole("button", { name: "Options" });
    trigger.focus();
    await user.keyboard(" ");
    await settle();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("does the same for an IconButton with a tooltip", async () => {
    const user = userEvent.setup();
    render(
      <DropdownWrapper
        trigger={<IconButton icon="chevronDown" tooltip="More" variant="secondary" />}
        dropdown={menu}
      />,
      { wrapper: wrap },
    );

    const trigger = screen.getByRole("button", { name: "More" });
    expect(trigger.tagName).toBe("BUTTON");
    trigger.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
  });

  it("does not submit a surrounding form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <DropdownWrapper trigger={<Button>Options</Button>} dropdown={menu} />
      </form>,
      { wrapper: wrap },
    );

    await user.click(screen.getByRole("button", { name: "Options" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps a caller's explicit type", () => {
    render(
      <form>
        <DropdownWrapper trigger={<Button type="submit">Save as</Button>} dropdown={menu} />
      </form>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button", { name: "Save as" })).toHaveAttribute("type", "submit");
  });

  it("has no axe violations, and no button nested in a button", async () => {
    const { container } = render(
      <>
        <DropdownWrapper trigger={<Button>Options</Button>} dropdown={menu} />
        <DropdownWrapper trigger={<Button onClick={() => {}}>Actions</Button>} dropdown={menu} />
        <DropdownWrapper
          trigger={<IconButton icon="chevronDown" tooltip="More" />}
          dropdown={menu}
        />
      </>,
      { wrapper: wrap },
    );
    await settle();

    // The wrappers stop claiming role="button" once the trigger is one.
    expect(screen.getAllByRole("button")).toHaveLength(3);
    await expectNoAxeViolations(container);
  });
});

describe("a Button with nothing to do, outside a trigger", () => {
  it("still renders the plain div it always has", () => {
    render(<Button>Decoration</Button>, { wrapper: wrap });
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Decoration").closest("button")).toBeNull();
  });

  it("stays a div inside a clickable Card, even when that Card is a trigger", async () => {
    const { container } = render(
      <>
        <Card href="/plans" padding="16">
          Plans <Button>Read more</Button>
        </Card>
        <DropdownWrapper
          trigger={
            <Card onClick={() => {}} padding="16">
              Workspace <Button>Switch</Button>
            </Card>
          }
          dropdown={menu}
        />
      </>,
      { wrapper: wrap },
    );

    expect(screen.getByText("Read more").closest("button, a")).toBe(
      screen.getByRole("link", { name: /Plans/ }),
    );
    // The Card is the control; the Button inside it must not become a second.
    const card = screen.getByText("Workspace").closest("button") as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.querySelectorAll("button")).toHaveLength(0);
    expect(card).not.toHaveAttribute("aria-haspopup");

    expect(container.querySelector("a button, button button")).toBeNull();
  });
});
