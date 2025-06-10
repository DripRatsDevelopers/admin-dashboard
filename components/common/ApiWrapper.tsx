"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { ReactNode } from "react";

type ApiWrapperProps<T> = {
  loading: boolean;
  error: string | null;
  data: T | null;
  skeleton?: ReactNode;
  children: ReactNode;
  emptyState?: ReactNode;
};

export function ApiWrapper<T>({
  loading,
  error,
  data,
  skeleton,
  children,
  emptyState,
}: ApiWrapperProps<T>) {
  if (loading) {
    return (
      skeleton || (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        </div>
      )
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-4 text-destructive">
        <AlertTriangle className="w-6 h-6" />
        <p>Something went wrong.</p>
      </div>
    );
  }

  if (!data && emptyState) {
    return <>{emptyState}</>;
  }
  if (!data) return null;

  if (data) return <>{children}</>;
}
