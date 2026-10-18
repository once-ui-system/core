import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { type ReactNode, useState } from "react";
import { Button } from "../src/components/Button";
import { ContextMenu } from "../src/components/ContextMenu";
import { Dropdown, DropdownWrapper, placeMenu } from "../src/components/DropdownWrapper";
import { Column } from "../src/components/Flex";
import { Option } from "../src/components/Select";
import { Text } from "../src/components/Text";
import { ThemeProvider } from "../src/theme";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

const menu = (
  <Column padding="4">
    <Option value="rename" label="Rename" />
    <Option value="delete" label="Delete" danger />
  </Column>
);

const bounds = { top: 0, right: 400, bottom: 800, left: 0 };

describe("placeMenu", () => {
  const trigger = { x: 20, y: 100, width: 120, height: 40 };

  it("opens under the trigger, lined up with its start or end", () => {
    expect(placeMenu("bottom-start", trigger, { width: 200, height: 100 }, bounds, 4)).toEqual({
      left: 20,
      top: 144,
      maxHeight: 656,
    });
    expect(placeMenu("bottom-end", trigger, { width: 100, height: 100 }, bounds, 4).left).toBe(40);
  });

  it("flips above when there is no room below", () => {
    const low = { ...trigger, y: 700 };
    const place = placeMenu("bottom-start", low, { width: 200, height: 200 }, bounds, 4);
    expect(place.top).toBe(496);
    expect(place.maxHeight).toBe(696);
  });

  it("mirrors and clamps along the side so it stays on screen", () => {
    // A press near the right edge opens the menu to the left of the point.
    const point = { x: 380, y: 50, width: 0, height: 0 };
    expect(placeMenu("bottom-start", point, { width: 150, height: 80 }, bounds, 0)).toEqual({
      left: 230,
      top: 50,
      maxHeight: 750,
    });
    // Too wide for either side: held inside the bounds.
    expect(placeMenu("bottom", trigger, { width: 390, height: 80 }, bounds, 4).left).toBe(0);
  });
});

describe("DropdownWrapper", () => {
  it("opens from a Button trigger, reports the pick and closes after it", async () => {
    const onSelect = jest.fn();
    const onOpenChange = jest.fn();
    const onPress = jest.fn();
    await wrap(
      <DropdownWrapper
        trigger={<Button label="Actions" onPress={onPress} />}
        dropdown={menu}
        onSelect={onSelect}
        onOpenChange={onOpenChange}
      />,
    );
    expect(screen.queryByText("Rename")).toBeNull();
    await fireEvent.press(screen.getByText("Actions"));
    // The Button's own handler still runs.
    expect(onPress).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await fireEvent.press(screen.getByText("Rename"));
    expect(onSelect).toHaveBeenCalledWith("rename");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByText("Rename")).toBeNull();
  });

  it("opens from a trigger that is not pressable itself", async () => {
    await wrap(<DropdownWrapper trigger={<Text>More</Text>} dropdown={menu} />);
    await fireEvent.press(screen.getByRole("button"));
    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("stays open with closeAfterClick off and closes on the backdrop", async () => {
    const onPress = jest.fn();
    await wrap(
      <DropdownWrapper
        closeAfterClick={false}
        trigger={<Button label="Filter" />}
        dropdown={<Option value="new" label="Newest" onPress={onPress} />}
      />,
    );
    await fireEvent.press(screen.getByText("Filter"));
    await fireEvent.press(screen.getByText("Newest"));
    expect(onPress).toHaveBeenCalledWith("new");
    expect(screen.getByText("Newest")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Close"));
    expect(screen.queryByText("Newest")).toBeNull();
  });

  it("follows a controlled open and marks the selected option", async () => {
    function Sort() {
      const [open, setOpen] = useState(true);
      const [sort, setSort] = useState("name");
      return (
        <DropdownWrapper
          open={open}
          onOpenChange={setOpen}
          selectedOption={sort}
          onSelect={setSort}
          trigger={<Button label={`Sort: ${sort}`} />}
          dropdown={
            <>
              <Option value="name" label="Name" />
              <Option value="date" label="Date" />
            </>
          }
        />
      );
    }
    await wrap(<Sort />);
    expect(screen.getByRole("menuitem", { name: "Name", selected: true })).toBeTruthy();
    await fireEvent.press(screen.getByText("Date"));
    expect(screen.getByText("Sort: date")).toBeTruthy();
    expect(screen.queryByRole("menuitem")).toBeNull();
  });

  it("ignores the trigger with disableTriggerClick", async () => {
    await wrap(
      <DropdownWrapper disableTriggerClick trigger={<Button label="Locked" />} dropdown={menu} />,
    );
    await fireEvent.press(screen.getByText("Locked"));
    expect(screen.queryByText("Rename")).toBeNull();
  });
});

describe("Dropdown", () => {
  it("passes option presses to onSelect and blocks them when disabled", async () => {
    const onSelect = jest.fn();
    const { rerender } = await wrap(<Dropdown onSelect={onSelect}>{menu}</Dropdown>);
    await fireEvent.press(screen.getByText("Delete"));
    expect(onSelect).toHaveBeenCalledWith("delete");
    await rerender(
      <ThemeProvider theme="dark">
        <Dropdown disabled onSelect={onSelect}>
          {menu}
        </Dropdown>
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByText("Rename"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe("ContextMenu", () => {
  it("opens on a long press and closes after a pick", async () => {
    const onSelect = jest.fn();
    await wrap(
      <ContextMenu dropdown={menu} onSelect={onSelect}>
        <Text>Photo.jpg</Text>
      </ContextMenu>,
    );
    await fireEvent.press(screen.getByText("Photo.jpg"));
    expect(screen.queryByText("Rename")).toBeNull();
    await fireEvent(screen.getByText("Photo.jpg"), "longPress", {
      nativeEvent: { pageX: 120, pageY: 300 },
    });
    await fireEvent.press(screen.getByText("Delete"));
    expect(onSelect).toHaveBeenCalledWith("delete");
    expect(screen.queryByText("Delete")).toBeNull();
  });

  it("keeps a pressable child's own handlers and ignores long presses when disabled", async () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    const { rerender } = await wrap(
      <ContextMenu dropdown={menu}>
        <Button label="Open file" onPress={onPress} onLongPress={onLongPress} />
      </ContextMenu>,
    );
    await fireEvent.press(screen.getByText("Open file"));
    expect(onPress).toHaveBeenCalled();
    await fireEvent(screen.getByText("Open file"), "longPress", { nativeEvent: {} });
    expect(onLongPress).toHaveBeenCalled();
    expect(screen.getByText("Rename")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Close"));
    await rerender(
      <ThemeProvider theme="dark">
        <ContextMenu dropdown={menu} disabled>
          <Text>Locked</Text>
        </ContextMenu>
      </ThemeProvider>,
    );
    await fireEvent(screen.getByText("Locked"), "longPress", { nativeEvent: {} });
    expect(screen.queryByText("Rename")).toBeNull();
  });
});
