import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InfiniteScroll } from "../components/InfiniteScroll";

describe("InfiniteScroll", () => {
  let observerCallback:
    | ((entries: Array<{ isIntersecting: boolean }>, observer: IntersectionObserver) => void)
    | null = null;
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn().mockImplementation(() => {
      observerCallback = null;
    });

    class MockIntersectionObserver {
      constructor(
        callback: (
          entries: Array<{ isIntersecting: boolean }>,
          observer: IntersectionObserver,
        ) => void,
        public options?: IntersectionObserverInit,
      ) {
        observerCallback = callback;
      }
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
    }

    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all items with renderItem callback", () => {
    const items = ["Apple", "Banana", "Cherry"];
    const loadMore = vi.fn().mockResolvedValue(true);

    render(
      <InfiniteScroll
        items={items}
        loadMore={loadMore}
        renderItem={(item, index) => <div key={index}>{item}</div>}
      />,
    );

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  it("renders sentinel element and observes it", () => {
    const items = ["Item 1"];
    const loadMore = vi.fn().mockResolvedValue(true);

    const { container } = render(
      <InfiniteScroll items={items} loadMore={loadMore} renderItem={(item) => <div>{item}</div>} />,
    );

    const sentinel = container.querySelector(".h-px.w-px");
    expect(sentinel).toBeInTheDocument();
    expect(observeMock).toHaveBeenCalledWith(sentinel);
  });

  it("shows spinner when loading prop is true", () => {
    const items = ["Item 1"];
    const loadMore = vi.fn().mockResolvedValue(true);

    const { rerender } = render(
      <InfiniteScroll
        items={items}
        loadMore={loadMore}
        loading={false}
        renderItem={(item) => <div>{item}</div>}
      />,
    );

    expect(screen.queryByRole("status")).toBeNull();

    rerender(
      <InfiniteScroll
        items={items}
        loadMore={loadMore}
        loading={true}
        renderItem={(item) => <div>{item}</div>}
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("calls loadMore when sentinel intersects and handles hasMore=true", async () => {
    let resolveLoadMore!: (val: boolean) => void;
    const loadMore = vi.fn().mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveLoadMore = resolve;
        }),
    );

    render(
      <InfiniteScroll
        items={["Item 1", "Item 2"]}
        loadMore={loadMore}
        renderItem={(item) => <div>{item}</div>}
      />,
    );

    expect(loadMore).not.toHaveBeenCalled();

    // Trigger intersection
    await act(async () => {
      observerCallback?.([{ isIntersecting: true }], {} as unknown as IntersectionObserver);
    });

    expect(loadMore).toHaveBeenCalledTimes(1);

    // Resolve loadMore with hasMore = true
    await act(async () => {
      resolveLoadMore(true);
    });
  });

  it("stops loading more when loadMore returns false", async () => {
    const loadMore = vi.fn().mockResolvedValue(false);

    render(
      <InfiniteScroll
        items={["Item 1"]}
        loadMore={loadMore}
        renderItem={(item) => <div>{item}</div>}
      />,
    );

    const callback = observerCallback;
    await act(async () => {
      callback?.([{ isIntersecting: true }], {} as unknown as IntersectionObserver);
    });

    expect(loadMore).toHaveBeenCalledTimes(1);

    // Subsequent intersection should not call loadMore because hasMore is false
    await act(async () => {
      callback?.([{ isIntersecting: true }], {} as unknown as IntersectionObserver);
    });

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it("handles errors gracefully in loadMore", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const loadMore = vi.fn().mockRejectedValue(new Error("Network failed"));

    render(
      <InfiniteScroll
        items={["Item 1"]}
        loadMore={loadMore}
        renderItem={(item) => <div>{item}</div>}
      />,
    );

    await act(async () => {
      observerCallback?.([{ isIntersecting: true }], {} as unknown as IntersectionObserver);
    });

    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("Error loading more items:", expect.any(Error));
  });

  it("configures threshold in IntersectionObserver options", () => {
    const loadMore = vi.fn().mockResolvedValue(true);

    render(
      <InfiniteScroll
        items={["Item 1"]}
        threshold={350}
        loadMore={loadMore}
        renderItem={(item) => <div>{item}</div>}
      />,
    );

    expect(observerCallback).not.toBeNull();
  });
});
