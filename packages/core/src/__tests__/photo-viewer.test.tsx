import { readFileSync } from "node:fs";
import path from "node:path";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PhotoViewer,
  type PhotoViewerItem,
  photoViewerIndexFromUrl,
  photoViewerSlug,
} from "../components/PhotoViewer";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { resetDialogState } from "../test/dialogTestUtils";
import { mockReducedMotion } from "../test/fxTestUtils";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items: PhotoViewerItem[] = [
  { src: "/photos/lake.jpg", alt: "A lake at dawn", title: "Lake", caption: "2024" },
  { src: "/photos/ridge.jpg?v=2", alt: "A ridge in fog" },
  { src: "/photos/harbour.webp", alt: "Boats in a harbour", title: "Harbour" },
];

/** A gallery: one button per photo, the viewer open while `open` is set. */
const Gallery = (props: Partial<React.ComponentProps<typeof PhotoViewer>> & { start?: number }) => {
  const [open, setOpen] = useState<number | null>(props.start ?? null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <>
      {items.map((item, i) => (
        <button
          key={item.src}
          type="button"
          ref={(el) => {
            tiles.current[i] = el;
          }}
          onClick={() => setOpen(i)}
        >
          View {item.alt}
        </button>
      ))}
      {open !== null && (
        <PhotoViewer
          items={items}
          defaultIndex={open}
          getOrigin={(i) => tiles.current[i] ?? null}
          {...props}
          onClose={(i) => {
            props.onClose?.(i);
            setOpen(null);
          }}
        />
      )}
    </>
  );
};

const dialog = () => screen.getByRole("dialog", { name: "Photo viewer" });
const status = () => dialog().querySelector("[aria-live]") as HTMLElement;

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
  // Reduced motion: every slide is instant and the fades are short, so tests need no frames.
  mockReducedMotion(true);
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("PhotoViewer: rendering", () => {
  it("is a named modal dialog announcing the photo, and passes axe", async () => {
    render(<Gallery start={0} />, { wrapper: wrap });
    expect(dialog()).toHaveAttribute("aria-modal", "true");
    expect(status()).toHaveTextContent("Photo 1 of 3: Lake. A lake at dawn");
    expect(screen.getByText("1 / 3 · 2024")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "A lake at dawn" })).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });

  it("renders nothing on the server and nothing throws", () => {
    expect(() => renderToString(<PhotoViewer items={items} onClose={() => {}} />)).not.toThrow();
  });

  it("takes translated words, keeping English for the rest", () => {
    render(
      <Gallery
        start={1}
        labels={{ dialog: "Fotos", counter: (current, total) => `Foto ${current}/${total}` }}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("dialog", { name: "Fotos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close photo viewer" })).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Fotos" }).querySelector("[aria-live]"),
    ).toHaveTextContent("Foto 2/3. A ridge in fog");
  });

  it("drops the arrows for a single photo", () => {
    render(<PhotoViewer items={[items[0]]} onClose={() => {}} />, { wrapper: wrap });
    expect(screen.queryByRole("button", { name: "Next photo" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous photo" })).toBeNull();
  });
});

describe("PhotoViewer: keyboard", () => {
  it("moves with the arrow keys and the buttons, and stops at either end", async () => {
    const onIndexChange = vi.fn();
    const user = userEvent.setup();
    render(<Gallery start={0} onIndexChange={onIndexChange} />, { wrapper: wrap });

    expect(screen.getByRole("button", { name: "Previous photo" })).toBeDisabled();
    await user.keyboard("{ArrowRight}");
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    expect(status()).toHaveTextContent("Photo 2 of 3. A ridge in fog");

    await user.click(screen.getByRole("button", { name: "Next photo" }));
    expect(status()).toHaveTextContent("Photo 3 of 3: Harbour");
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();

    await user.keyboard("{ArrowRight}");
    expect(onIndexChange).toHaveBeenCalledTimes(2);

    await user.keyboard("{ArrowLeft}");
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it("follows a controlled index", () => {
    const Controlled = () => {
      const [index, setIndex] = useState(0);
      return (
        <>
          <button type="button" onClick={() => setIndex(2)}>
            Jump
          </button>
          <PhotoViewer items={items} index={index} onIndexChange={setIndex} onClose={() => {}} />
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    // The page under the viewer is inert; press its button directly.
    act(() => {
      (screen.getByText("Jump") as HTMLButtonElement).click();
    });
    expect(status()).toHaveTextContent("Photo 3 of 3");
  });

  it("closes on Escape and hands focus back to the photo's tile", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Gallery onClose={onClose} />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "View A lake at dawn" }));
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onClose).toHaveBeenCalledExactlyOnceWith(1);
    expect(screen.getByRole("button", { name: "View A ridge in fog" })).toHaveFocus();
  });

  it("closes from its close button", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Gallery start={2} onClose={onClose} />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Close photo viewer" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledExactlyOnceWith(2));
  });

  it("keeps Tab inside the viewer", async () => {
    const user = userEvent.setup();
    render(<Gallery start={1} />, { wrapper: wrap });
    const inside = () => dialog().contains(document.activeElement);
    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(inside()).toBe(true);
    }
  });
});

describe("PhotoViewer: reduced motion", () => {
  it("steps between photos at once instead of sliding", () => {
    render(<Gallery start={0} />, { wrapper: wrap });
    fireEvent.keyDown(document, { key: "ArrowRight" });
    // No frame has run: under reduced motion the slide is instant.
    expect(status()).toHaveTextContent("Photo 2 of 3");
  });

  it("slides, rather than stepping at once, without it", async () => {
    mockReducedMotion(false);
    render(<Gallery start={0} />, { wrapper: wrap });
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(status()).toHaveTextContent("Photo 1 of 3");
    await waitFor(() => expect(status()).toHaveTextContent("Photo 2 of 3"));
  });
});

describe("PhotoViewer: deep links", () => {
  it("names a photo by its file name and finds it in a URL", () => {
    expect(photoViewerSlug("/photos/ridge.jpg?v=2")).toBe("ridge");
    window.history.replaceState(null, "", "/gallery?photo=harbour");
    expect(photoViewerIndexFromUrl(items)).toBe(2);
    expect(photoViewerIndexFromUrl(items, "other")).toBe(-1);
  });

  it("leaves the URL and history alone without deepLink", async () => {
    const user = userEvent.setup();
    const length = window.history.length;
    render(<Gallery start={0} />, { wrapper: wrap });
    await user.keyboard("{ArrowRight}");
    expect(window.location.search).toBe("");
    expect(window.history.length).toBe(length);
  });

  it("keeps the open photo in the URL, and Back closes the viewer", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/gallery");
    render(<Gallery start={0} deepLink="photo" onClose={onClose} />, { wrapper: wrap });
    expect(window.location.search).toBe("?photo=lake");

    await user.keyboard("{ArrowRight}");
    expect(window.location.search).toBe("?photo=ridge");

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledExactlyOnceWith(1));
  });

  it("drops the parameter on close when it opened from a shared link", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/gallery?photo=harbour");
    render(<Gallery start={photoViewerIndexFromUrl(items)} deepLink="photo" />, {
      wrapper: wrap,
    });
    expect(status()).toHaveTextContent("Photo 3 of 3");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(window.location.pathname + window.location.search).toBe("/gallery");
  });
});

// Pages with a single enlargeable image must not pay for the viewer's gesture code.
describe("PhotoViewer: bundle boundary", () => {
  it("is never imported by Media", () => {
    const media = readFileSync(path.join(__dirname, "../components/Media.tsx"), "utf8");
    expect(media).not.toMatch(/PhotoViewer/);
  });
});
