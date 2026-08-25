import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Logo, logoVariants } from "../components/Logo";
import { resetScrollLockState } from "../components/ScrollLock";
import { ToastContext } from "../contexts/ToastProvider";

describe("Logo", () => {
  beforeEach(() => {
    resetScrollLockState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports logoVariants with correct height classes", () => {
    expect(logoVariants({ size: "xs" })).toContain("w-auto");
    expect(logoVariants({ size: "xs" })).toContain("h-20");
    expect(logoVariants({ size: "s" })).toContain("h-24");
    expect(logoVariants({ size: "m" })).toContain("h-32");
    expect(logoVariants({ size: "l" })).toContain("h-40");
    expect(logoVariants({ size: "xl" })).toContain("h-48");
    expect(logoVariants()).toContain("h-32");
  });

  it("renders default logo container as flex div with rounded-l and h-fit", () => {
    const { container } = render(<Logo icon="/icon.svg" wordmark="/wordmark.svg" />);
    const logoDiv = container.firstElementChild as HTMLElement;

    expect(logoDiv).toBeInTheDocument();
    expect(logoDiv.tagName).toBe("DIV");
    expect(logoDiv).toHaveAttribute("aria-label", "Trademark");
    expect(logoDiv).toHaveClass("flex", "rounded-l", "h-fit");

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "/icon.svg");
    expect(images[0]).toHaveAttribute("alt", "Trademark");
    expect(images[0]).toHaveClass("w-auto", "h-32");

    expect(images[1]).toHaveAttribute("src", "/wordmark.svg");
    expect(images[1]).toHaveAttribute("alt", "Trademark");
    expect(images[1]).toHaveClass("w-auto", "h-32");
  });

  it("renders all size variants correctly on images", () => {
    const { rerender } = render(<Logo icon="/icon.svg" size="xs" />);
    expect(screen.getByRole("img")).toHaveClass("h-20");

    rerender(<Logo icon="/icon.svg" size="s" />);
    expect(screen.getByRole("img")).toHaveClass("h-24");

    rerender(<Logo icon="/icon.svg" size="m" />);
    expect(screen.getByRole("img")).toHaveClass("h-32");

    rerender(<Logo icon="/icon.svg" size="l" />);
    expect(screen.getByRole("img")).toHaveClass("h-40");

    rerender(<Logo icon="/icon.svg" size="xl" />);
    expect(screen.getByRole("img")).toHaveClass("h-48");
  });

  it("renders only icon when wordmark is not provided", () => {
    render(<Logo icon="/icon.svg" />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("src", "/icon.svg");
  });

  it("renders only wordmark when icon is not provided", () => {
    render(<Logo wordmark="/wordmark.svg" />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("src", "/wordmark.svg");
  });

  it("warns when both icon and wordmark are missing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Logo />);

    expect(warnSpy).toHaveBeenCalledWith(
      "Both 'icon' and 'wordmark' props are set to false. The logo will not render any content.",
    );
  });

  it("renders as Next.js Link when href is provided", () => {
    const { container } = render(
      <Logo icon="/icon.svg" wordmark="/wordmark.svg" href="https://once-ui.com" />,
    );
    const link = container.firstElementChild as HTMLElement;

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://once-ui.com");
    expect(link).toHaveAttribute("aria-label", "Trademark");
    expect(link).toHaveClass("flex", "rounded-l", "h-fit");
  });

  it("applies dark and light theme classes correctly", () => {
    const { container, rerender } = render(<Logo icon="/icon.svg" dark />);
    expect(container.firstElementChild).toHaveClass("dark-flex");

    rerender(<Logo icon="/icon.svg" light />);
    expect(container.firstElementChild).toHaveClass("light-flex");
  });

  it("forwards ref to the div element when href is not provided", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Logo ref={ref} icon="/icon.svg" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards ref to the anchor element when href is provided", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Logo ref={ref} icon="/icon.svg" href="/home" />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Logo icon="/icon.svg" className="custom-logo-class" style={{ opacity: 0.8 }} />,
    );
    const logoDiv = container.firstElementChild as HTMLElement;
    expect(logoDiv).toHaveClass("custom-logo-class");
    expect(logoDiv.style.opacity).toBe("0.8");
  });

  describe("Brand Context Menu", () => {
    it("renders ContextMenu and opens on right-click when brand prop is provided", () => {
      render(
        <Logo
          icon="/icon.svg"
          wordmark="/wordmark.svg"
          brand={{ copy: true, url: "https://once-ui.com/brand" }}
        />,
      );

      const target = screen.getByLabelText("Trademark");
      fireEvent.contextMenu(target, { clientX: 100, clientY: 100 });

      expect(screen.getByText("Copy icon as SVG")).toBeInTheDocument();
      expect(screen.getByText("Copy wordmark as SVG")).toBeInTheDocument();
      expect(screen.getByText("Visit brand guidelines")).toBeInTheDocument();
    });

    it("copies icon svg to clipboard on clicking copy-icon option", async () => {
      const mockSvg = "<svg>icon-content</svg>";
      globalThis.fetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve(mockSvg),
      } as Response);

      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const addToast = vi.fn();

      render(
        <ToastContext.Provider value={{ toasts: [], addToast, removeToast: vi.fn() }}>
          <Logo icon="/icon.svg" brand={{ copy: true }} />
        </ToastContext.Provider>,
      );

      const target = screen.getByLabelText("Trademark");
      fireEvent.contextMenu(target, { clientX: 100, clientY: 100 });

      const copyOption = screen.getByText("Copy icon as SVG");
      fireEvent.click(copyOption);

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/icon.svg");
        expect(writeTextMock).toHaveBeenCalledWith(mockSvg);
        expect(addToast).toHaveBeenCalledWith({
          variant: "success",
          message: "Icon copied to clipboard as SVG",
        });
      });
    });

    it("copies wordmark svg to clipboard on clicking copy-wordmark option", async () => {
      const mockSvg = "<svg>wordmark-content</svg>";
      globalThis.fetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve(mockSvg),
      } as Response);

      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const addToast = vi.fn();

      render(
        <ToastContext.Provider value={{ toasts: [], addToast, removeToast: vi.fn() }}>
          <Logo wordmark="/wordmark.svg" brand={{ copy: true }} />
        </ToastContext.Provider>,
      );

      const target = screen.getByLabelText("Trademark");
      fireEvent.contextMenu(target, { clientX: 100, clientY: 100 });

      const copyOption = screen.getByText("Copy wordmark as SVG");
      fireEvent.click(copyOption);

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/wordmark.svg");
        expect(writeTextMock).toHaveBeenCalledWith(mockSvg);
        expect(addToast).toHaveBeenCalledWith({
          variant: "success",
          message: "Wordmark copied to clipboard as SVG",
        });
      });
    });

    it("handles clipboard copy errors gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

      const addToast = vi.fn();

      render(
        <ToastContext.Provider value={{ toasts: [], addToast, removeToast: vi.fn() }}>
          <Logo icon="/icon.svg" brand={{ copy: true }} />
        </ToastContext.Provider>,
      );

      const target = screen.getByLabelText("Trademark");
      fireEvent.contextMenu(target, { clientX: 100, clientY: 100 });

      const copyOption = screen.getByText("Copy icon as SVG");
      fireEvent.click(copyOption);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(addToast).toHaveBeenCalledWith({
          variant: "danger",
          message: "Failed to copy icon to clipboard",
        });
      });
    });
  });
});
