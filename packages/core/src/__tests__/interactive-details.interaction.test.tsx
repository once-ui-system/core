import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { InteractiveDetails } from "../components/InteractiveDetails";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * The label and description beside a Checkbox, Switch or RadioButton. A click
 * on the text hands off to the control (`onClick`); the help button beside the
 * label is its own control and must not toggle anything. The ids let the
 * control reference the label and description.
 */
describe("InteractiveDetails", () => {
  it("renders the label and description and passes axe", async () => {
    const { container } = render(
      <InteractiveDetails label="Notifications" description="Email me" onClick={() => {}} />,
      { wrapper },
    );
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Email me")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("puts labelId and descriptionId on the texts so a control can point at them", () => {
    render(
      <>
        <input
          type="checkbox"
          aria-labelledby="lbl"
          aria-describedby="desc"
          data-testid="control"
        />
        <InteractiveDetails
          label="Notifications"
          description="Email me"
          labelId="lbl"
          descriptionId="desc"
          onClick={() => {}}
        />
      </>,
      { wrapper },
    );
    const control = screen.getByRole("checkbox");
    expect(control).toHaveAccessibleName("Notifications");
    expect(control).toHaveAccessibleDescription("Email me");
  });

  it("calls onClick for a click on the label or description", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<InteractiveDetails label="Notifications" description="Email me" onClick={onClick} />, {
      wrapper,
    });
    await user.click(screen.getByText("Notifications"));
    await user.click(screen.getByText("Email me"));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("renders no description element without a description", () => {
    const { container } = render(<InteractiveDetails label="Only" onClick={() => {}} />, {
      wrapper,
    });
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  it("shows a named help button only when it has a tooltip, and its click stays its own", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onHelp = vi.fn();
    const { rerender, container } = render(
      <InteractiveDetails label="Notifications" onClick={onClick} iconButtonProps={{}} />,
      { wrapper },
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(
      <InteractiveDetails
        label="Notifications"
        onClick={onClick}
        iconButtonProps={{ tooltip: "What is this?", onClick: onHelp }}
      />,
    );
    const help = screen.getByRole("button", { name: "More information" });
    await user.click(help);
    expect(onHelp).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(onHelp).toHaveBeenCalledTimes(2);
    expect(onClick).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("dims a disabled label and shows a not-allowed cursor", () => {
    const { container } = render(
      <InteractiveDetails label="Notifications" disabled onClick={() => {}} />,
      { wrapper },
    );
    expect(screen.getByText("Notifications").className).toMatch(/neutral-on-background-weak/);
    expect(container.firstElementChild?.className).toMatch(/cursor-not-allowed/);
  });

  // Current behaviour, flagged as questionable: `disabled` is only styling;
  // the parent controls (Checkbox, Switch, RadioButton) guard the click.
  it("still calls onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<InteractiveDetails label="Notifications" disabled onClick={onClick} />, { wrapper });
    await user.click(screen.getByText("Notifications"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards the ref and id to the root", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { container } = render(
      <InteractiveDetails ref={ref} id="details" label="Notifications" onClick={() => {}} />,
      { wrapper },
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveAttribute("id", "details");
  });
});
