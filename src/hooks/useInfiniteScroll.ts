import { useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export const useInfiniteScroll = ({
  isLoading,
  hasMore,
  onLoadMore,
  threshold = 200,
}: UseInfiniteScrollProps) => {
  const callback = useRef(onLoadMore);
  callback.current = onLoadMore;

  useEffect(() => {
    if (isLoading || !hasMore) return undefined;

    let ticking = false;
    let armed = true;

    const check = () => {
      ticking = false;
      if (!armed) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        // One load per arrival at the bottom; re-armed when `hasMore` or the
        // loading state changes.
        armed = false;
        callback.current();
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLoading, hasMore, threshold]);
};
