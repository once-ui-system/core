import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "../components/Accordion";
import { Avatar } from "../components/Avatar";
import { Checkbox } from "../components/Checkbox";
import { CompareImage } from "../components/CompareImage";
import { Dialog } from "../components/Dialog";
import { EmojiPicker } from "../components/EmojiPicker";
import { Feedback } from "../components/Feedback";
import { Fieldset } from "../components/Fieldset";
import { HoverCard } from "../components/HoverCard";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { NumberInput } from "../components/NumberInput";
import { OTPInput } from "../components/OTPInput";
import { ProgressBar } from "../components/ProgressBar";
import { RadioGroup } from "../components/RadioGroup";
import { Setting } from "../components/Setting";
import { Skeleton } from "../components/Skeleton";
import { Slider } from "../components/Slider";
import { Switch } from "../components/Switch";
import { Table } from "../components/Table";
import { TagInput } from "../components/TagInput";
import { Textarea } from "../components/Textarea";
import { Timeline } from "../components/Timeline";
import { ToggleButton } from "../components/ToggleButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { LinearGauge } from "../modules/data/LinearGauge";
import { RadialGauge } from "../modules/data/RadialGauge";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Findings of the October 2026 accessibility drill: axe over every docs page
 * in light and dark, each fixed in the component and pinned here.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("accessibility drill", () => {
  it("keeps a closed Accordion's content out of the tab order, with unique ids", async () => {
    const { container } = render(
      <>
        <Accordion title="One">
          <a href="/one">Link one</a>
        </Accordion>
        <Accordion title="Two" open>
          <a href="/two">Link two</a>
        </Accordion>
      </>,
      { wrapper: wrap },
    );
    const [first, second] = screen.getAllByRole("button");
    const firstPanel = document.getElementById(first.getAttribute("aria-controls") ?? "");
    const secondPanel = document.getElementById(second.getAttribute("aria-controls") ?? "");
    expect(firstPanel).not.toBeNull();
    expect(firstPanel).not.toBe(secondPanel);
    expect(firstPanel?.inert).toBe(true);
    expect(secondPanel?.inert).toBe(false);
    await expectNoAxeViolations(container);

    fireEvent.click(first);
    expect(firstPanel?.inert).toBe(false);
  });

  it("names every Avatar on its image role", async () => {
    const { container } = render(
      <>
        <Avatar value="AB" />
        <Avatar empty />
        <Avatar value="CD" statusIndicator={{ scheme: "green" }} />
        <Avatar loading />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("img", { name: "Avatar with initials AB" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Empty avatar" })).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "Avatar with initials CD, status: green" }),
    ).toBeTruthy();
    expect(screen.getByRole("status", { name: "Loading avatar" })).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it("exposes a labelled Icon and Skeleton", async () => {
    const { container } = render(
      <>
        <Icon name="close" aria-label="Warning" />
        <Icon name="close" decorative={false} />
        <Icon name="close" />
        <Skeleton shape="line" aria-label="Loading name" />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("img", { name: "Warning" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "close" })).toBeTruthy();
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByRole("status", { name: "Loading name" })).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it("names a ProgressBar", async () => {
    const { container } = render(
      <>
        <ProgressBar value={40} />
        <ProgressBar value={60} aria-label="Upload" />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("progressbar", { name: "Progress" })).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Upload" })).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it("names a Setting's slider and switch by the row's label", async () => {
    const { container } = render(
      <>
        <Setting label="Opacity">
          <Slider min={0} max={100} defaultValue={50} />
        </Setting>
        <Setting label="Autoplay">
          <Switch />
        </Setting>
        <Setting
          label="Tilt"
          axes={[
            { label: "X", control: <Slider min={-45} max={45} defaultValue={0} /> },
            { label: "Y", control: <Slider min={-45} max={45} defaultValue={0} /> },
          ]}
        />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("slider", { name: "Opacity" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Autoplay" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Tilt X" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Tilt Y" })).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it("labels a Textarea rendered without an id", async () => {
    const { container } = render(<Textarea {...({} as { id: string })} label="Notes" />, {
      wrapper: wrap,
    });
    expect(screen.getByLabelText("Notes").tagName).toBe("TEXTAREA");
    await expectNoAxeViolations(container);
  });

  it("moves the CompareImage handle with the keyboard", async () => {
    const { container } = render(
      <CompareImage
        leftContent={{ src: <div>Before</div> }}
        rightContent={{ src: <div>After</div> }}
      />,
      { wrapper: wrap },
    );
    const handle = screen.getByRole("slider", { name: "Compare images" });
    expect(handle.getAttribute("aria-valuenow")).toBe("50");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handle.getAttribute("aria-valuenow")).toBe("51");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
    await expectNoAxeViolations(container);
  });

  it("gives the EmojiPicker valid structure and named category tabs", async () => {
    const { container } = render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });
    expect(screen.queryAllByRole("gridcell")).toHaveLength(0);
    await expectNoAxeViolations(container);
  });

  it("interrupts only for problems: danger is an alert, info a polite status", () => {
    render(
      <>
        <Feedback tone="danger" title="Payment failed" />
        <Feedback tone="info" title="Heads up" />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Payment failed");
    expect(screen.getByRole("status")).toHaveTextContent("Heads up");
  });

  it("gives a ToggleButton a pressed state and keeps it out of forms", () => {
    render(<ToggleButton label="Bold" selected />, { wrapper: wrap });
    const button = screen.getByRole("button", { name: "Bold" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("type", "button");
  });

  it("exposes both gauges as named meters", async () => {
    const { container } = render(
      <>
        <LinearGauge value={40} aria-label="Disk" />
        <RadialGauge value={70} aria-label="CPU" />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("meter", { name: "Disk" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByRole("meter", { name: "CPU" })).toHaveAttribute("aria-valuenow", "70");
    await expectNoAxeViolations(container);
  });

  it("moves focus into a Dialog when it opens", async () => {
    render(
      <Dialog open onClose={() => {}} title="Rename">
        <input aria-label="Name" />
      </Dialog>,
      { wrapper: wrap },
    );
    await screen.findByRole("dialog");
    await new Promise((resolve) => setTimeout(resolve, 400));
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("disables custom controls inside a disabled Fieldset", () => {
    render(
      <Fieldset legend="Plan" disabled>
        <Checkbox label="Agree" />
        <Switch label="Notify" checked={false} />
        <RadioGroup
          aria-label="Tier"
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
          ]}
        />
      </Fieldset>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("checkbox", { name: "Agree" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("aria-disabled", "true");
    }
  });

  it("keeps NumberInput's stepper buttons out of the Tab order", () => {
    render(<NumberInput id="qty" label="Quantity" />, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "Increment value" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(screen.getByRole("button", { name: "Decrement value" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("gives two searchable Tables their own control ids", () => {
    const columns = [{ key: "name" as const, header: "Name" }];
    const rows = [{ name: "Ada" }];
    const { container } = render(
      <>
        <Table aria-label="First" columns={columns} rows={rows} searchable />
        <Table aria-label="Second" columns={columns} rows={rows} searchable />
      </>,
      { wrapper: wrap },
    );
    const ids = Array.from(container.querySelectorAll("input[id]")).map((input) => input.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reads a Timeline as a list with the active step marked", () => {
    render(
      <Timeline
        items={[
          { label: "Ordered", tone: "success" },
          { label: "Shipped", tone: "brand" },
          { label: "Delivered" },
        ]}
      />,
      { wrapper: wrap },
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute("aria-current", "step");
  });

  it("reads OTPInput as one labelled code with a one-time-code field first", async () => {
    const onComplete = vi.fn();
    const { container } = render(
      <OTPInput length={6} error errorMessage="Wrong code" onComplete={onComplete} />,
      { wrapper: wrap },
    );
    const group = screen.getByRole("group", { name: "One-time code" });
    const fields = within(group).getAllByRole("textbox") as HTMLInputElement[];
    expect(fields).toHaveLength(6);
    expect(fields[0]).toHaveAttribute("autocomplete", "one-time-code");
    expect(fields[1]).toHaveAttribute("autocomplete", "off");
    expect(fields[5]).toHaveAccessibleName("OTP digit 6 of 6");
    expect(fields[2]).toHaveAttribute("aria-invalid", "true");
    expect(fields[2]).toHaveAccessibleDescription("Wrong code");
    await expectNoAxeViolations(container);

    // The browser's autofill sets the whole code on the first field at once.
    fireEvent.change(fields[0], { target: { value: "482913" } });
    expect(fields.map((field) => field.value).join("")).toBe("482913");
    expect(onComplete).toHaveBeenCalledWith("482913");
  });

  it("names OTPInput's group and fields from labels, or from the caller's aria-label", () => {
    render(
      <>
        <OTPInput
          length={4}
          labels={{ group: "Code de vérification", digit: (n, of) => `Chiffre ${n} sur ${of}` }}
        />
        <OTPInput length={4} aria-label="Backup code" />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("group", { name: "Code de vérification" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Chiffre 2 sur 4" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Backup code" })).toBeInTheDocument();
  });

  it("lists TagInput's tags, removes the last with Backspace and says so", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <TagInput
        id="skills"
        label="Skills"
        description="Press Enter to add a skill"
        defaultValue={["React", "Sass"]}
        onValueChange={onChange}
      />,
      { wrapper: wrap },
    );
    const field = screen.getByRole("textbox", { name: "Skills" });
    expect(field).toHaveAccessibleDescription("Press Enter to add a skill");
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["React", "Sass"]);
    // Before: each tag's label was a focusable toggle, "pressed", that did nothing.
    expect(screen.queryByRole("button", { name: "React" })).toBeNull();
    expect(within(items[1]).getByRole("button", { name: "Remove tag Sass" })).toBeInTheDocument();
    await expectNoAxeViolations(container);

    await user.click(field);
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith(["React"]);
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent("Removed tag Sass");

    // A removed tag's button leaves with it; focus goes back to the field.
    await user.click(screen.getByRole("button", { name: "Remove tag React" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(field).toHaveFocus();
    expect(live).toHaveTextContent("Removed tag React");
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("keeps Backspace editing the text while TagInput's field has some", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput id="t" label="Tags" defaultValue={["a"]} onValueChange={onChange} />, {
      wrapper: wrap,
    });
    await user.type(screen.getByRole("textbox", { name: "Tags" }), "bc{Backspace}");
    expect(screen.getByRole("textbox", { name: "Tags" })).toHaveValue("b");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("lets the keyboard reach a HoverCard's links, and leave them", async () => {
    const user = userEvent.setup();
    render(
      <>
        <HoverCard trigger={<button type="button">Ada</button>}>
          <a href="/ada">Profile</a>
          <a href="/ada/posts">Posts</a>
        </HoverCard>
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    const trigger = screen.getByRole("button", { name: "Ada" });
    await user.tab();
    expect(trigger).toHaveFocus();
    const profile = await screen.findByRole("link", { name: "Profile" });
    const card = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
    expect(card).toContainElement(profile);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(card?.style.visibility).toBe("visible"));
    await expectNoAxeViolations(document.body);

    // Before: Tab went from the trigger straight to "After", closing the card.
    await user.tab();
    expect(profile).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Posts" })).toHaveFocus();
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(trigger).toHaveFocus();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole("link", { name: "Profile" })).toBeNull());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");
  });

  it("returns focus to the HoverCard's trigger on Escape from inside the card", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<button type="button">Ada</button>}>
        <a href="/ada">Profile</a>
      </HoverCard>,
      { wrapper: wrap },
    );
    await user.tab();
    const link = await screen.findByRole("link", { name: "Profile" });
    await waitFor(() => expect(link.parentElement?.style.visibility).toBe("visible"));
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("link", { name: "Profile" })).toBeNull());
    expect(screen.getByRole("button", { name: "Ada" })).toHaveFocus();
  });

  it("opens a HoverCard on keyboard focus, not on the focus a press gives", async () => {
    render(
      <HoverCard trigger={<button type="button">Ada</button>}>
        <span>Design engineer</span>
      </HoverCard>,
      { wrapper: wrap },
    );
    const trigger = screen.getByRole("button", { name: "Ada" });
    fireEvent.pointerDown(trigger);
    fireEvent.mouseDown(trigger);
    fireEvent.focus(trigger);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByText("Design engineer")).toBeNull();
    fireEvent.blur(trigger);
    fireEvent.focus(trigger);
    expect(await screen.findByText("Design engineer")).toBeInTheDocument();
    // Text only: it describes the trigger while open, and expands nothing.
    await waitFor(() => expect(trigger).toHaveAccessibleDescription("Design engineer"));
    expect(trigger).not.toHaveAttribute("aria-expanded");
  });
});
