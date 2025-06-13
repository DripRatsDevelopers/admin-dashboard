// hooks/useAuth.ts - Enhanced with security checks
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Check auth every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Important for cookies
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // Token is invalid, redirect to login
        setUser(null);
        if (window.location.pathname.startsWith("/admin")) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error(error);
      setUser(null);
      if (window.location.pathname.startsWith("/admin")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/login", {
        method: "DELETE",
        credentials: "include",
      });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if request fails
      setUser(null);
      router.push("/login");
    }
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
    refreshAuth: checkAuth,
  };
}
