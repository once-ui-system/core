"use client";

import {
  type ComponentProps,
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Column } from "./Column";
import { Row } from "./Row";
import { Spinner } from "./Spinner";

export interface InfiniteScrollProps<T> extends ComponentProps<typeof Row> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  loadMore: () => Promise<boolean>;
  loading?: boolean;
  threshold?: number;
  className?: string;
}

function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  loading = false,
  threshold = 200,
  ...flex
}: InfiniteScrollProps<T>) {
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(loading);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(loading);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Keep internal loading in sync with prop
  useEffect(() => {
    setIsLoading(loading);
    isLoadingRef.current = loading;
  }, [loading]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const more = await loadMore();
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (error) {
      console.error("Error loading more items:", error);
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [loadMore]);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    if (typeof IntersectionObserver === "undefined") return;

    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0,
      },
    );
    observerRef.current = observer;

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, threshold, handleLoadMore]);

  return (
    <>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: items is a generic list without guaranteed unique ID fields
        <Fragment key={index}>{renderItem(item, index)}</Fragment>
      ))}

      {/* Sentinel at the end */}
      <Row {...flex}>
        <div ref={sentinelRef} className="h-px w-px" style={{ height: 1, width: 1 }} />
      </Row>

      {isLoading && (
        <Column fillWidth horizontal="center" padding="24">
          <Spinner size="m" />
        </Column>
      )}
    </>
  );
}

InfiniteScroll.displayName = "InfiniteScroll";

export { InfiniteScroll };
