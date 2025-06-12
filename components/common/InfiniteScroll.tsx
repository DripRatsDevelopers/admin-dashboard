"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface InfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  children: React.ReactNode;
  loader?: React.ReactNode;
  showLoader?: boolean;
}

const InfiniteScroll = ({
  loading,
  hasMore,
  loadMore,
  children,
  loader,
  showLoader,
}: InfiniteScrollProps) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].isIntersecting) {
          loadMore();
          observer.unobserve(entries[0].target);
          observer.disconnect();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) {
        observer.disconnect();
      }
    };
  }, [hasMore, loading]);

  return (
    <>
      {children}
      {loading &&
        showLoader &&
        (loader || (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ))}
      {hasMore ? <div ref={observerRef} className="h-1" /> : <></>}
    </>
  );
};

export default InfiniteScroll;
