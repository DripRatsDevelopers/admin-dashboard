import { dripRatsFetch, Method } from "@/lib/apiClient";
import {
  InfiniteData,
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

export interface PaginatedResponse<
  T,
  cursorType = Record<string, number | string | boolean> | null
> {
  Items: T[];
  LastEvaluatedKey?: cursorType;
}

interface UseInfinitePaginatedQueryOptions<
  T,
  cursorType = Record<string, number | string | boolean> | null
> {
  queryKey: [string];
  fetchPage: (lastKey: cursorType) => Promise<PaginatedResponse<T, cursorType>>;
  enabled?: boolean;
}

interface IDripRatsQuery<TData, TError> {
  queryKey: string | unknown[];
  apiParams?: {
    url: string;
    options?: RequestInit;
    headers?: Record<string, string>;
  };
  queryFn?: () => Promise<TData>;
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">;
}

interface IDripratsMutation<TData, TError, TVariables> {
  apiParams: {
    method?: Method;
    url: string;
    body?: unknown;
    headers?: Record<string, string>;
  };
  mutationFn?: (variables: TVariables) => Promise<TData>;
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, unknown>,
    "mutationFn"
  >;
}
export function useInfinitePaginatedQuery<
  T,
  cursorType = Record<string, number | string | boolean> | null
>({
  queryKey,
  fetchPage,
  enabled = true,
}: UseInfinitePaginatedQueryOptions<
  T,
  cursorType | null
>): UseInfiniteQueryResult<
  InfiniteData<PaginatedResponse<T, cursorType | null>>,
  Error
> {
  return useInfiniteQuery<
    PaginatedResponse<T, cursorType | null>,
    Error,
    InfiniteData<PaginatedResponse<T, cursorType | null>>,
    [string],
    cursorType | null
  >({
    queryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<[string], cursorType | null>) =>
      await fetchPage(pageParam as cursorType | null),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.LastEvaluatedKey ?? undefined,
    enabled,
    staleTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  });
}

export function useDripratsQuery<TData, TError = Error>({
  queryKey,
  apiParams,
  queryFn,
  options,
}: IDripRatsQuery<TData, TError>): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: queryFn ? queryFn : () => dripRatsFetch(apiParams),
    staleTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useDripratsMutation<TData, TVariables = void, TError = Error>({
  mutationFn,
  apiParams,
  options,
}: IDripratsMutation<TData, TError, TVariables>): UseMutationResult<
  TData,
  TError,
  TVariables
> {
  return useMutation({
    mutationFn: mutationFn ? mutationFn : () => dripRatsFetch(apiParams),
    ...options,
  });
}
