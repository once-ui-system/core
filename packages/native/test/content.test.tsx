import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Accordion,
  type AccordionHandle,
  AvatarGroup,
  List,
  ListItem,
  Media,
  StatusIndicator,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  ThemeProvider,
  ToggleButton,
} from "../src";
import { parseAspectRatio } from "../src/components/Media";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const wrap = (node: React.ReactNode) => render(<ThemeProvider theme="light">{node}</ThemeProvider>);

/** jsdom never loads images: this one does, on the next tick. */
class LoadingImage {
  onload: ((e: unknown) => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 1600;
  naturalHeight = 900;
  set src(_uri: string) {
    setTimeout(() => this.onload?.({}), 0);
  }
}

describe("content", () => {
  it("reads core's aspect ratios", () => {
    expect(parseAspectRatio("16 / 9")).toBeCloseTo(16 / 9);
    expect(parseAspectRatio("1")).toBe(1);
    expect(parseAspectRatio("original")).toBeUndefined();
    expect(parseAspectRatio("wide")).toBeUndefined();
  });

  it("Media shows a skeleton until the image loads", async () => {
    vi.stubGlobal("Image", LoadingImage);
    wrap(<Media src="https://example.com/latte.jpg" alt="A latte" aspectRatio="16 / 9" />);
    expect(screen.getByLabelText("Loading")).toBeTruthy();
    // react-native-web adds a hidden <img> of its own for the browser.
    expect(screen.getAllByRole("img", { name: "A latte" }).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.queryByLabelText("Loading")).toBeNull());
  });

  it("Media with loading shows only the skeleton", () => {
    wrap(<Media src="https://example.com/latte.jpg" alt="A latte" loading />);
    expect(screen.getByLabelText("Loading")).toBeTruthy();
    expect(screen.queryByRole("img", { name: "A latte" })).toBeNull();
  });

  it("Media is pressable and shows its caption", () => {
    const onPress = vi.fn();
    wrap(
      <Media
        src="https://example.com/latte.jpg"
        alt="A latte"
        caption="Oat latte"
        onPress={onPress}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "A latte" }));
    expect(onPress).toHaveBeenCalledOnce();
    expect(screen.getByText("Oat latte")).toBeTruthy();
  });

  it("List bullets items, and numbers them from start when ordered", () => {
    wrap(
      <>
        <List>
          <ListItem>Espresso</ListItem>
          <ListItem>Flat white</ListItem>
        </List>
        <List as="ol" start={3}>
          <ListItem>Grind</ListItem>
          <ListItem>
            Brew <Text>slowly</Text>
          </ListItem>
        </List>
      </>,
    );
    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getAllByText("•")).toHaveLength(2);
    expect(screen.getByText("3.")).toBeTruthy();
    expect(screen.getByText("4.")).toBeTruthy();
    expect(screen.getByText("Espresso")).toBeTruthy();
  });

  it("Tabs selects the first tab and switches panels", () => {
    const onChange = vi.fn();
    wrap(
      <Tabs onChange={onChange}>
        <TabList>
          <Tab value="menu">Menu</Tab>
          <Tab value="rewards">Rewards</Tab>
        </TabList>
        <TabPanel value="menu">
          <Text>Coffee list</Text>
        </TabPanel>
        <TabPanel value="rewards">
          <Text>Stamp card</Text>
        </TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toBeTruthy();
    const [menu, rewards] = screen.getAllByRole("tab");
    expect(menu.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Coffee list")).toBeTruthy();
    expect(screen.queryByText("Stamp card")).toBeNull();

    fireEvent.click(rewards);
    expect(onChange).toHaveBeenCalledWith("rewards");
    expect(rewards.getAttribute("aria-selected")).toBe("true");
    expect(menu.getAttribute("aria-selected")).toBe("false");
    expect(screen.getByText("Stamp card")).toBeTruthy();
    expect(screen.queryByText("Coffee list")).toBeNull();

    fireEvent.click(rewards);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("controlled Tabs follow value, and skip disabled tabs", () => {
    function Controlled() {
      const [tab, setTab] = useState("b");
      return (
        <Tabs value={tab} onChange={setTab}>
          <TabList>
            <Tab value="a" disabled>
              A
            </Tab>
            <Tab value="b">B</Tab>
            <Tab value="c">C</Tab>
          </TabList>
          <TabPanel value="c" keepMounted>
            <Text>Panel C</Text>
          </TabPanel>
        </Tabs>
      );
    }
    wrap(<Controlled />);
    const [a, b, c] = screen.getAllByRole("tab");
    expect(b.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Panel C")).toBeTruthy();
    fireEvent.click(a);
    expect(b.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(c);
    expect(c.getAttribute("aria-selected")).toBe("true");
  });

  it("ToggleButton reports selected and calls onClick", () => {
    const onClick = vi.fn();
    wrap(<ToggleButton label="Bold" selected onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Bold" });
    expect(button.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("Accordion expands and collapses", () => {
    wrap(
      <Accordion title="Opening hours">
        <Text>7am to 6pm</Text>
      </Accordion>,
    );
    const header = screen.getByRole("button", { name: /Opening hours/ });
    expect(header.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(header);
    expect(header.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(header);
    expect(header.getAttribute("aria-expanded")).toBe("false");
  });

  it("Accordion opens from its handle, or follows open with onToggle", () => {
    const ref = createRef<AccordionHandle>();
    const onToggle = vi.fn();
    wrap(
      <>
        <Accordion ref={ref} title="Handle">
          <Text>One</Text>
        </Accordion>
        <Accordion title="Controlled" open onToggle={onToggle}>
          <Text>Two</Text>
        </Accordion>
      </>,
    );
    act(() => ref.current?.open());
    expect(screen.getByRole("button", { name: /Handle/ }).getAttribute("aria-expanded")).toBe(
      "true",
    );
    const controlled = screen.getByRole("button", { name: /Controlled/ });
    fireEvent.click(controlled);
    expect(onToggle).toHaveBeenCalledOnce();
    expect(controlled.getAttribute("aria-expanded")).toBe("true");
  });

  it("Accordion takes core 3.0's defaultOpen and onOpenChange", () => {
    const onOpenChange = vi.fn();
    wrap(
      <Accordion title="Next" defaultOpen onOpenChange={onOpenChange}>
        <Text>Three</Text>
      </Accordion>,
    );
    const header = screen.getByRole("button", { name: /Next/ });
    expect(header.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(header);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(header.getAttribute("aria-expanded")).toBe("false");
  });

  it("Tabs report through core 3.0's onValueChange too", () => {
    const onValueChange = vi.fn();
    wrap(
      <Tabs onValueChange={onValueChange}>
        <TabList>
          <Tab value="a" label="A" />
          <Tab value="b" label="B" />
        </TabList>
      </Tabs>,
    );
    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("AvatarGroup shows up to limit and counts the rest", () => {
    wrap(<AvatarGroup limit={2} avatars={[{ value: "AB" }, { value: "CD" }, { value: "EF" }]} />);
    expect(screen.getByLabelText("Avatar AB")).toBeTruthy();
    expect(screen.getByLabelText("Avatar CD")).toBeTruthy();
    expect(screen.queryByLabelText("Avatar EF")).toBeNull();
    expect(screen.getByText("+1")).toBeTruthy();
  });

  it("StatusIndicator is an image named after its colour", () => {
    wrap(
      <>
        <StatusIndicator color="green" />
        <StatusIndicator color="red" ariaLabel="Closed" size="l" />
        <StatusIndicator scheme="yellow" />
      </>,
    );
    expect(screen.getByRole("img", { name: "yellow status indicator" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "green status indicator" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Closed" })).toBeTruthy();
  });
});

describe("Flex props on Media and StatusIndicator", () => {
  it("honour hide and a breakpoint's style", () => {
    const { container } = render(
      <ThemeProvider theme="dark">
        <Media src="https://example.com/a.jpg" alt="Latte" hide />
        <StatusIndicator color="green" xl={{ style: { marginTop: 7 } }} ariaLabel="Open" />
      </ThemeProvider>,
    );
    expect(container.querySelector("img")).toBeNull();
    const dot = container.querySelector('[aria-label="Open"]') as HTMLElement;
    expect(dot.style.marginTop).toBe("7px");
  });
});
