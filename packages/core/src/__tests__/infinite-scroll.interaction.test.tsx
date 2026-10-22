import { act, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** An IntersectionObserver the test can fire, standing in for scrolling to the end. */
class ControllableObserver {
  static instances: ControllableObserver[] = [];
  readonly targets = new Set<Element>();
  disconnected = false;
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    ControllableObserver.instances.push(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.disconnected = true;
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }
}

/** Brings the sentinel into view for every live observer. */
const reachEnd = async (isIntersecting = true) => {
  await act(async () => {
    for (const observer of ControllableObserver.instances) {
      if (observer.disconnected) continue;
      for (const target of observer.targets) {
        observer.callback(
          [{ isIntersecting, target } as unknown as IntersectionObserverEntry],
          observer as unknown as IntersectionObserver,
        );
      }
    }
  });
};

const live = () => ControllableObserver.instances.filter((o) => !o.disconnected);

beforeEach(() => {
  ControllableObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", ControllableObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const Feed = ({
  pages = 3,
  loadMore,
}: {
  pages?: number;
  loadMore?: (add: () => void) => Promise<boolean>;
}) => {
  const [items, setItems] = useState(["Post 1", "Post 2"]);
  const add = () => setItems((current) => [...current, `Post ${current.length + 1}`]);
  return (
    // Not a <ul>: the sentinel and spinner are siblings of the items, which a
    // list may not hold (flagged as questionable in the report).
    <section aria-label="Feed">
      <InfiniteScroll
        items={items}
        renderItem={(item) => <article>{item}</article>}
        loadMore={
          loadMore
            ? () => loadMore(add)
            : async () => {
                add();
                return items.length + 1 < pages;
              }
        }
      />
    </section>
  );
};

/**
 * A list that asks for more when its end comes into view: once per arrival,
 * with a spinner while it waits, and never again once `loadMore` says there
 * is no more (or fails).
 */
describe("InfiniteScroll", () => {
  it("renders every item and watches a sentinel past the last one", async () => {
    render(<Feed />, { wrapper });
    expect(screen.getAllByRole("article").map((post) => post.textContent)).toEqual([
      "Post 1",
      "Post 2",
    ]);
    expect(live()).toHaveLength(1);
    expect(live()[0].options?.rootMargin).toBe("0px 0px 200px 0px");
  });

  it("loads more when the end comes into view", async () => {
    render(<Feed />, { wrapper });
    await reachEnd();
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("does nothing when the sentinel only leaves the view", async () => {
    const loadMore = vi.fn(async () => true);
    render(<Feed loadMore={loadMore} />, { wrapper });
    await reachEnd(false);
    expect(loadMore).not.toHaveBeenCalled();
  });

  it("shows a spinner while loading and asks only once until it settles", async () => {
    let resolve: (more: boolean) => void = () => {};
    const loadMore = vi.fn(
      (add: () => void) =>
        new Promise<boolean>((r) => {
          resolve = (more) => {
            add();
            r(more);
          };
        }),
    );
    const { container } = render(<Feed loadMore={loadMore} />, { wrapper });
    await reachEnd();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    await reachEnd();
    expect(loadMore).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(container);

    await act(async () => resolve(true));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    await reachEnd();
    expect(loadMore).toHaveBeenCalledTimes(2);
  });

  it("stops asking once loadMore returns false", async () => {
    const loadMore = vi.fn(async (add: () => void) => {
      add();
      return false;
    });
    render(<Feed loadMore={loadMore} />, { wrapper });
    await reachEnd();
    await reachEnd();
    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(live()).toHaveLength(0);
  });

  it("logs and stops asking when loadMore rejects", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const loadMore = vi.fn(async () => {
      throw new Error("offline");
    });
    render(<Feed loadMore={loadMore} />, { wrapper });
    await reachEnd();
    await waitFor(() => expect(error).toHaveBeenCalled());
    await reachEnd();
    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the spinner and does not observe while the host says it is loading", () => {
    render(
      <InfiniteScroll
        items={["A"]}
        renderItem={(item) => <p>{item}</p>}
        loadMore={async () => true}
        loading
        threshold={50}
      />,
      { wrapper },
    );
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(live()).toHaveLength(0);
  });

  it("disconnects its observer on unmount", () => {
    const { unmount } = render(<Feed />, { wrapper });
    unmount();
    expect(live()).toHaveLength(0);
  });
});
