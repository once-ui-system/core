import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Button } from "../src/components/Button";
import { Drawer } from "../src/components/Drawer";
import { Field, Fieldset, FormErrorSummary, SubmitButton } from "../src/components/Field";
import { corners, Form, place } from "../src/components/Form";
import { Input } from "../src/components/Input";
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

describe("Form", () => {
  it("places spans row by row and rounds only the group's outer corners", () => {
    // Three fields in two columns: the second keeps its bottom-right corner.
    const cells = corners(place([1, 1, 1], 2), 2);
    expect(cells.map((c) => c.round)).toEqual([
      { tl: true, tr: false, bl: false, br: false },
      { tl: false, tr: true, bl: false, br: true },
      { tl: false, tr: false, bl: true, br: true },
    ]);
    expect(cells[2].fuseTop).toBe(true);
    expect(cells[1].fuseLeft).toBe(true);
    // A span that does not fit moves to the next row.
    expect(place([1, 2], 2).map((p) => p.row)).toEqual([0, 1]);
  });

  it("submits from a SubmitButton and ignores taps while the promise runs", async () => {
    let finish: () => void = () => {};
    const onSubmit = jest.fn(() => new Promise<void>((done) => (finish = done)));
    await wrap(
      <Form as="form" onSubmit={onSubmit}>
        <Input label="Email" />
        <SubmitButton label="Send" pendingLabel="Sending" />
      </Form>,
    );
    await fireEvent.press(screen.getByText("Send"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Sending")).toBeTruthy();
    await fireEvent.press(screen.getByText("Sending"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    expect(await screen.findByText("Send")).toBeTruthy();
  });

  it("wires a Field's label, error and hint onto its control", async () => {
    await wrap(
      <Field label="Email" error="Enter an email" hint="For the receipt" required>
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input.props.accessibilityHint).toBe("Enter an email. For the receipt");
    expect(screen.getByText("Enter an email")).toBeTruthy();
    expect(screen.getByText("*", { includeHiddenElements: true })).toBeTruthy();
  });

  it("disables the fields in a disabled Fieldset, and lists errors in a summary", async () => {
    await wrap(
      <Form>
        <FormErrorSummary errors={{ email: "Enter an email", name: "" }} />
        <Fieldset legend="Contact" disabled>
          <Input label="Phone" />
        </Fieldset>
        <Button label="Plain" />
      </Form>,
    );
    expect(screen.getByText("Contact")).toBeTruthy();
    expect(screen.getByLabelText("Phone").props.editable).toBe(false);
    expect(screen.getByText("Check the highlighted fields")).toBeTruthy();
    expect(screen.getAllByText("•")).toHaveLength(1);
  });
});
