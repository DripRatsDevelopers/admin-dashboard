"use client";

import OrdersDashboard from "@/components/common/OrdersTab";
import ProductList from "@/components/common/ProductList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "products", label: "Products" },
  { value: "orders", label: "Orders" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 md:mt-0">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-500 capitalize bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                {user?.role}
              </span>
              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
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

          {activeTab === "orders" && <OrdersDashboard />}

          {activeTab === "products" && <ProductList />}
        </section>
      </main>
    </div>
  );
}
