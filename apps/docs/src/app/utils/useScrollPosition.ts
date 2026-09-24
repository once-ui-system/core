import { useCallback, useEffect, useRef } from "react";

const useScrollPosition = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const saveScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      sessionStorage.setItem("sidebar-scroll-position", scrollRef.current.scrollTop.toString());
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    const storedScrollPosition = sessionStorage.getItem("sidebar-scroll-position");
    if (storedScrollPosition && scrollRef.current) {
      // Temporarily disable smooth scrolling for position restoration
      scrollRef.current.style.scrollBehavior = "auto";
      scrollRef.current.scrollTop = parseFloat(storedScrollPosition);
      // Re-enable smooth scrolling after a small delay
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.style.scrollBehavior = "";
        }
      });
    }
  }, []);

  useEffect(() => {
    restoreScrollPosition();

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", saveScrollPosition);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", saveScrollPosition);
      }
    };
  }, [saveScrollPosition, restoreScrollPosition]);

  return scrollRef;
};

export default useScrollPosition;
