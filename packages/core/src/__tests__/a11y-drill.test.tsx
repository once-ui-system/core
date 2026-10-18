import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Accordion } from "../components/Accordion";
import { Avatar } from "../components/Avatar";
import { CompareImage } from "../components/CompareImage";
import { EmojiPicker } from "../components/EmojiPicker";
import { Icon } from "../components/Icon";
import { ProgressBar } from "../components/ProgressBar";
import { Setting, SettingAxes } from "../components/Setting";
import { Skeleton } from "../components/Skeleton";
import { Slider } from "../components/Slider";
import { Switch } from "../components/Switch";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts/LayoutProvider";
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
        <Avatar value="CD" statusIndicator={{ color: "green" }} />
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
        <SettingAxes
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
});
