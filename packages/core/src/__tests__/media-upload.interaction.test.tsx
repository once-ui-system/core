import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { MediaUpload } from "../modules/media/MediaUpload";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const png = () => new File(["x"], "photo.png", { type: "image/png" });

beforeEach(() => {
  // jsdom has no object URLs.
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:preview"),
  });
});

const fileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

/** The drop zone, once the lazily loaded implementation has rendered. */
// The first render waits on the lazily imported implementation.
const zone = () =>
  screen.findByRole("button", { name: /Drag and drop or click to browse/ }, { timeout: 5000 });

/**
 * MediaUpload is a drop zone that opens the file picker. It used to be a
 * bare div with a click handler: no role, out of the Tab order, so a
 * keyboard user could not upload at all. And a rejected upload left the
 * spinner up forever. These protect the zone as a button the keyboard
 * reaches, the picker it opens, a preview and upload for a picked or dropped
 * image, and the end of the busy state whatever the upload does.
 */
describe("MediaUpload: interaction", () => {
  it("is a button the keyboard reaches, opening the file picker on Enter and Space", async () => {
    const user = userEvent.setup();
    const { container } = render(<MediaUpload compress={false} />, { wrapper: wrap });
    const button = await zone();
    const click = vi.spyOn(fileInput(container), "click");
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(click).toHaveBeenCalledTimes(2);
    await user.click(button);
    expect(click).toHaveBeenCalledTimes(3);
    await expectNoAxeViolations(container);
  });

  it("previews and uploads a picked image", async () => {
    const user = userEvent.setup();
    const onFileUpload = vi.fn(() => Promise.resolve());
    const { container } = render(<MediaUpload compress={false} onFileUpload={onFileUpload} />, {
      wrapper: wrap,
    });
    await zone();
    const file = png();
    await user.upload(fileInput(container), file);
    expect(onFileUpload).toHaveBeenCalledWith(file);
    expect(await screen.findByAltText("Preview of uploaded image")).toBeInTheDocument();
  });

  it("uploads a dropped image", async () => {
    const onFileUpload = vi.fn(() => Promise.resolve());
    render(<MediaUpload compress={false} onFileUpload={onFileUpload} />, { wrapper: wrap });
    const button = await zone();
    const file = png();
    fireEvent.dragOver(button);
    fireEvent.drop(button, { dataTransfer: { files: [file] } });
    await waitFor(() => expect(onFileUpload).toHaveBeenCalledWith(file));
  });

  it("refuses a file that is not an image", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onFileUpload = vi.fn(() => Promise.resolve());
    const { container } = render(<MediaUpload compress={false} onFileUpload={onFileUpload} />, {
      wrapper: wrap,
    });
    await zone();
    await user.upload(
      fileInput(container),
      new File(["%PDF"], "doc.pdf", { type: "application/pdf" }),
    );
    expect(onFileUpload).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it("ends the busy state when the upload fails, and logs the error", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    let reject!: (error: Error) => void;
    const onFileUpload = vi.fn(
      () =>
        new Promise<void>((_, r) => {
          reject = r;
        }),
    );
    const { container } = render(<MediaUpload compress={false} onFileUpload={onFileUpload} />, {
      wrapper: wrap,
    });
    await zone();
    fireEvent.change(fileInput(container), { target: { files: [png()] } });
    await waitFor(() => expect(screen.queryByText(/Drag and drop/)).not.toBeInTheDocument());
    await act(async () => reject(new Error("offline")));
    expect(await screen.findByText(/Drag and drop/)).toBeInTheDocument();
    expect(error).toHaveBeenCalledWith("Upload error:", expect.any(Error));
  });

  it("shows the preview it starts with", async () => {
    render(<MediaUpload initialPreviewImage="/avatar.png" />, { wrapper: wrap });
    const image = await screen.findByAltText("Preview of uploaded image");
    expect(image.getAttribute("src")).toContain("avatar.png");
  });
});
