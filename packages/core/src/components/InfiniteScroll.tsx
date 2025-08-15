"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Column, Row, Spinner } from ".";

export interface InfiniteScrollProps<T> extends React.ComponentProps<typeof Row> {
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Keep internal loading in sync with prop
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const more = await loadMore();
      setHasMore(more);
    } catch (error) {
      console.error("Error loading more items:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMore || isLoading) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0,
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [items.length, hasMore, isLoading, threshold]);

  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
      ))}

      {/* Sentinel at the end */}
      <Row {...flex}>
        <div ref={sentinelRef} style={{ height: 1, width: 1 }} />
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