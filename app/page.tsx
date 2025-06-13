"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
          Welcome to <span className="text-purple-400">Driprats</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-6">
          Driprats is your go-to luxury-futuristic jewelry and accessories
          store, designed with precision and curated for bold expression. Manage
          your products and orders with our sleek admin dashboard.
        </p>
        <Button
          className="bg-purple-500 hover:bg-purple-600 text-white text-lg px-6 py-3 rounded-xl"
          onClick={() => router.push("/login")}
        >
          Admin Login
        </Button>
      </div>
    </div>
  );
}
