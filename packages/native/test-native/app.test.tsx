import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Drawer } from "../src/components/Drawer";
import { Nav, NavGroup, NavItem, NavSection } from "../src/components/Nav";
import { Text } from "../src/components/Text";
import { ThemeProvider } from "../src/theme";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

describe("Drawer", () => {
  it("shows its title and content while open, and asks to close", async () => {
    const onClose = jest.fn();
    await wrap(
      <Drawer open onClose={onClose} title="Filters" footer={<Text>Footer</Text>}>
        <Text>Only open tables</Text>
      </Drawer>,
    );
    expect(await screen.findByText("Filters")).toBeTruthy();
    expect(screen.getByText("Only open tables")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing while closed", async () => {
    await wrap(
      <Drawer open={false} onClose={() => {}} title="Filters">
        <Text>Hidden</Text>
      </Drawer>,
    );
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("unmounts after sliding out", async () => {
    jest.useFakeTimers();
    const view = await wrap(
      <Drawer open onClose={() => {}} title="Menu" side="left">
        <Text>Links</Text>
      </Drawer>,
    );
    expect(await screen.findByText("Links")).toBeTruthy();
    await view.rerender(
      <ThemeProvider theme="dark">
        <Drawer open={false} onClose={() => {}} title="Menu" side="left">
          <Text>Links</Text>
        </Drawer>
      </ThemeProvider>,
    );
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByText("Links")).toBeNull();
    jest.useRealTimers();
  });
});

describe("Nav", () => {
  it("is a bottom tab bar as a row: tabs that know which one is current", async () => {
    const onPress = jest.fn();
    await wrap(
      <Nav direction="row">
        <NavItem icon="home" label="Home" selected />
        <NavItem icon="calendar" label="Bookings" badge={12} onPress={onPress} />
      </Nav>,
    );
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Home");
    expect(screen.getByText("9+")).toBeTruthy();
    await fireEvent.press(screen.getByText("Bookings"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is a list of rows as a column, with sections and a group that opens", async () => {
    await wrap(
      <Nav density="compact">
        <NavSection label="Workspace">
          <NavItem icon="home" label="Overview" selected />
          <NavItem label="Inbox" badge={0} indicator />
        </NavSection>
        <NavGroup label="Projects">
          <NavItem label="Launch" />
        </NavGroup>
      </Nav>,
    );
    expect(screen.getByText("Workspace")).toBeTruthy();
    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText("Launch")).toBeNull();
    await fireEvent.press(screen.getByText("Projects"));
    expect(await screen.findByText("Launch")).toBeTruthy();
  });
});
