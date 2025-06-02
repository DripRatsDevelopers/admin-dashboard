"use client";

import ProductList from "@/components/common/ProductList";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "products", label: "Products" },
  { value: "orders", label: "Orders" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="flex min-h-screen">
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 md:w-48 border-r bg-background p-4 space-y-2
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight mt-12 md:mt-0">
          Admin
        </h2>
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              setActiveTab(tab.value);
              setSidebarOpen(false);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-4 md:p-6 pt-16 md:pt-6">
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
