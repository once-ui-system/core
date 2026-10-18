import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { App } from "../demo-src/App";

// The demo screens under the real React Native renderer: every component
// mounts, and the interactions a person would make work end to end.
describe("demo screens on React Native", () => {
  it("renders the loyalty card and adds a stamp", async () => {
    await render(<App theme="dark" />);
    expect(screen.getByText("Morning Coffee")).toBeTruthy();
    expect(screen.getByText("7/10")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Add stamp" }));
    expect(screen.getByText("8/10")).toBeTruthy();
    expect(screen.getByText("Stamp added")).toBeTruthy();
  });

  it("toggles the switch and the checkbox", async () => {
    await render(<App theme="light" />);
    await fireEvent.press(screen.getByRole("switch", { checked: true }));
    expect(screen.getByRole("switch", { checked: false })).toBeTruthy();
    await fireEvent.press(screen.getByRole("checkbox", { checked: true }));
    expect(screen.getByRole("checkbox", { checked: false })).toBeTruthy();
  });

  it("picks a venue in the Select sheet and places an order", async () => {
    await render(<App theme="dark" screen="order" />);
    await fireEvent.press(screen.getByRole("combobox", { name: "Pick up at" }));
    // The sheet fades in, and a see-through element doesn't count as shown.
    await fireEvent.press(await screen.findByRole("menuitem", { name: /Andrássy út 2/ }));
    jest.useFakeTimers();
    expect(screen.getByRole("combobox", { value: { text: "Andrássy út 2" } })).toBeTruthy();
    await fireEvent.press(screen.getByRole("radio", { name: "Whole milk" }));
    expect(screen.getByRole("radio", { name: "Whole milk", checked: true })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Place order" }));
    expect(screen.getByText("Order placed. See you soon!")).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(6100);
    });
    expect(screen.queryByText("Order placed. See you soon!")).toBeNull();
    jest.useRealTimers();
  });

  it("opens and closes the redeem sheet", async () => {
    await render(<App theme="light" screen="sheet" />);
    expect(screen.getByText("MC-4821")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Later" }));
    expect(screen.queryByText("MC-4821")).toBeNull();
  });
});
