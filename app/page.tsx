"use client";

import ProductList from "@/components/common/ProductList";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "products", label: "Products" },
  { value: "orders", label: "Orders" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <main className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="w-48 border-r p-4 space-y-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Admin
        </h2>
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-6">
        {activeTab === "overview" && (
          <div className="text-muted-foreground">[Overview Placeholder]</div>
        )}

        {activeTab === "orders" && (
          <div className="text-muted-foreground">[Orders Placeholder]</div>
        )}

        {activeTab === "products" && <ProductList />}
      </section>
    </main>
  );
}
