import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { MediaLibrary } from "../modules/media/MediaLibrary";
import { MediaPicker } from "../modules/media/MediaPicker";
import {
  createMemoryMediaAdapter,
  type MediaAsset,
  type MediaLibraryAdapter,
  mediaKindOfFile,
} from "../modules/media/mediaAdapter";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:upload"),
  });
  // jsdom has no IntersectionObserver; InfiniteScroll needs one.
  class Observer {
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    writable: true,
    value: Observer,
  });
});

const asset = (id: string, extra: Partial<MediaAsset> = {}): MediaAsset => ({
  id,
  name: `${id}.jpg`,
  src: `/${id}.jpg`,
  kind: "image",
  folderId: null,
  ...extra,
});

const seeded = () =>
  createMemoryMediaAdapter({
    folders: [
      { id: "brand", name: "Brand", parentId: null },
      { id: "logos", name: "Logos", parentId: "brand" },
    ],
    assets: [asset("one", { folderId: "brand" }), asset("two"), asset("clip", { kind: "video" })],
  });

const tile = (name: string) => screen.findByRole("button", { name });

describe("MediaLibrary", () => {
  it("lists through the adapter and narrows to a folder", async () => {
    const adapter = seeded();
    const list = vi.spyOn(adapter, "list");
    render(<MediaLibrary adapter={adapter} />, { wrapper: wrap });
    await tile("one.jpg");
    expect(screen.getByRole("button", { name: "two.jpg" })).toBeTruthy();
    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ folderId: null }));

    fireEvent.click(await screen.findByRole("treeitem", { name: "Brand" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "two.jpg" })).toBeNull());
    expect(screen.getByRole("button", { name: "one.jpg" })).toBeTruthy();
    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ folderId: "brand" }));
  });

  it("has no axe violations", async () => {
    const { container } = render(<MediaLibrary adapter={seeded()} />, { wrapper: wrap });
    await tile("one.jpg");
    await expectNoAxeViolations(container);
  });

  it("shows only the controls the adapter can back", async () => {
    const readOnly: MediaLibraryAdapter = {
      list: async () => ({ items: [asset("solo")] }),
    };
    render(<MediaLibrary adapter={readOnly} />, { wrapper: wrap });
    await tile("solo.jpg");
    expect(screen.queryByRole("button", { name: "Upload" })).toBeNull();
    expect(screen.queryByRole("tree")).toBeNull();
    expect(screen.queryByRole("button", { name: "Actions" })).toBeNull();
  });

  it("selects several and reports the assets", async () => {
    const onSelectionChange = vi.fn();
    render(<MediaLibrary adapter={seeded()} onSelectionChange={onSelectionChange} />, {
      wrapper: wrap,
    });
    fireEvent.click(await tile("one.jpg"));
    fireEvent.click(await tile("two.jpg"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      ["one", "two"],
      [expect.objectContaining({ id: "one" }), expect.objectContaining({ id: "two" })],
    );
    expect(screen.getByText("2 selected")).toBeTruthy();
  });

  it("uploads dropped files into the open folder", async () => {
    const adapter = seeded();
    const upload = vi.spyOn(adapter, "upload");
    render(<MediaLibrary adapter={adapter} />, { wrapper: wrap });
    await tile("one.jpg");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["x"], "new.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    await tile("new.png");
    expect(upload).toHaveBeenCalledWith(file, expect.objectContaining({ folderId: null }));
  });

  it("refuses kinds it does not accept, without calling the adapter", async () => {
    const adapter = seeded();
    const upload = vi.spyOn(adapter, "upload");
    render(<MediaLibrary adapter={adapter} accept={["image"]} />, { wrapper: wrap });
    await tile("one.jpg");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["x"], "talk.mp3", { type: "audio/mpeg" })] },
    });
    await screen.findByText("talk.mp3 is not a file this library takes.");
    expect(upload).not.toHaveBeenCalled();
  });

  it("deletes after confirming, and puts the tile back when the adapter fails", async () => {
    const user = userEvent.setup();
    const adapter = seeded();
    adapter.remove = vi.fn(async () => {
      throw new Error("offline");
    });
    render(<MediaLibrary adapter={adapter} />, { wrapper: wrap });
    fireEvent.click(await tile("two.jpg"));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(adapter.remove).toHaveBeenCalledWith(["two"]);
    await screen.findByText("That did not work. Nothing was changed.");
    expect(await tile("two.jpg")).toBeTruthy();
  });

  it("creates a folder through the adapter", async () => {
    const user = userEvent.setup();
    const adapter = seeded();
    render(<MediaLibrary adapter={adapter} />, { wrapper: wrap });
    await screen.findByRole("treeitem", { name: "Brand" });
    await user.click(screen.getByRole("button", { name: "New folder" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Folder name"), "Launch");
    await user.click(within(dialog).getByRole("button", { name: "Create" }));
    await screen.findByRole("treeitem", { name: "Launch" });
  });

  it("shows a retry when listing fails", async () => {
    let fail = true;
    const adapter: MediaLibraryAdapter = {
      list: async () => {
        if (fail) throw new Error("down");
        return { items: [asset("back")] };
      },
    };
    render(<MediaLibrary adapter={adapter} />, { wrapper: wrap });
    const retry = await screen.findByRole("button", { name: "Retry" });
    fail = false;
    fireEvent.click(retry);
    await tile("back.jpg");
  });
});

describe("MediaPicker", () => {
  it("hands back the picked asset and closes", async () => {
    const onPick = vi.fn();
    const onClose = vi.fn();
    render(
      <MediaPicker open onClose={onClose} onPick={onPick} adapter={seeded()} accept={["image"]} />,
      { wrapper: wrap },
    );
    fireEvent.click(await tile("two.jpg"));
    fireEvent.click(screen.getByRole("button", { name: "Choose" }));
    expect(onPick).toHaveBeenCalledWith([expect.objectContaining({ id: "two" })]);
    expect(onClose).toHaveBeenCalled();
  });
});

describe("mediaKindOfFile", () => {
  it("reads the MIME type, then the name", () => {
    expect(mediaKindOfFile({ type: "video/mp4", name: "a" })).toBe("video");
    expect(mediaKindOfFile({ type: "", name: "logo.SVG" })).toBe("image");
    expect(mediaKindOfFile({ type: "application/pdf", name: "brief.pdf" })).toBe("file");
  });
});
