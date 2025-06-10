import { fetchOrders } from "@/lib/orderUtils";
import { OrderEnum } from "@/types/order";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

interface UseOrdersParams {
  status?: OrderEnum | "ALL";
  search?: string;
  limit?: number;
}

export function useOrders({
  status = "ALL",
  search = "",
  limit = 20,
}: UseOrdersParams = {}) {
  const queryClient = useQueryClient();

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["orders", { status, search: debouncedSearch, limit }],
    queryFn: ({ pageParam }) =>
      fetchOrders({
        pageParam,
        status,
        search: debouncedSearch,
        limit,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextKey : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Flatten the pages into a single array of orders
  const orders = data?.pages.flatMap((page) => page.orders) ?? [];

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Refresh function
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Invalidate and refetch orders
  const invalidateOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }, [queryClient]);

  return {
    orders,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    refreshing: isFetching && !isFetchingNextPage,
    error: isError ? error?.message || "An error occurred" : null,
    hasMore: hasNextPage,
    loadMore,
    refresh,
    invalidateOrders,
  };
}
