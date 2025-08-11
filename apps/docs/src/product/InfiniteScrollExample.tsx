"use client";

import React, { useState, useCallback } from "react";
import { InfiniteScroll, Background, Column } from "@once-ui-system/core";

export function InfiniteScrollExample() {
  const [items, setItems] = useState(Array(5).fill(null).map((_, i) => i));
  const [loading, setLoading] = useState(false);
  
  const loadMore = useCallback(async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lastItem = items[items.length - 1] || 0;
    const newItems = Array(5).fill(null).map((_, i) => lastItem + i + 1);
    
    setItems(prev => [...prev, ...newItems]);
    setLoading(false);
    
    // Return true if there are more items to load
    return items.length < 50;
  }, [items]);
  
  return (
    <Column fillWidth height={40} overflow="auto" 
      gap="16"
      padding="16">
      <InfiniteScroll
        items={items}
        loadMore={loadMore}
        loading={loading}
        threshold={200}
        renderItem={(item) => (
          <Background
            key={item}
            background="neutral-alpha-weak"
            lines={{display: true, color: "neutral-alpha-weak"}}
            fillWidth
            radius="m"
            minHeight={8}
            border="neutral-alpha-medium"
            shadow="m"
          />
        )}
      />
    </Column>
  );
}
