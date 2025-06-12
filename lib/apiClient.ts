import { getAuth } from "firebase/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Method = "GET" | "POST" | "PUT" | "DELETE";

interface FetchOptions {
  url: string;
  method?: Method;
  body?: any;
  headers?: Record<string, string>;
  autoFetch?: boolean;
  queryParams?: Record<string, any>;
  skip?: boolean;
}

export async function dripRatsFetch(apiParams?: FetchOptions) {
  if (!apiParams) return;
  const { url, method = "GET", body, headers = {} } = apiParams;
  if (!url) return;
  const auth = getAuth();
  const user = auth.currentUser;

  const token = user ? await user.getIdToken() : null;

  const res = await fetch(`${url}`, {
    method: method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const response = await res.json();
  if (!res.ok || !response?.body?.success) {
    throw new Error(response.message || response?.data?.message || "API Error");
  }
  const data = response?.body?.data;
  return data;
}

export function apiResponse({
  success,
  data = null,
  error = null,
  status = 200,
}: {
  success: boolean;
  data?: Record<string, unknown> | null;
  error?: string | null;
  status?: number;
}) {
  return {
    status,
    body: { success: success ?? false, data, error },
  };
}
