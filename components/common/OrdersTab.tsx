import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useOrders } from "@/hooks/useOrders";
import cloudinaryLoader from "@/lib/cloudinaryUtils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderDetails, OrderEnum, shippingInfo } from "@/types/order";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Filter,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import AddressForm from "./AddressForm";
import { ApiWrapper } from "./ApiWrapper";
import InfiniteScroll from "./InfiniteScroll";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CONFIRMED"
  | "SHIPPED"
  | "OUTFORDELIVERY"
  | "DELIVERED";

interface OrderStatusConfig {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StatsData {
  total: number;
  pending: number;
  shipped: number;
  delivered: number;
}

const orderStatuses: Record<OrderEnum, OrderStatusConfig> = {
  [OrderEnum.PENDING]: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  [OrderEnum.PAID]: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CreditCard,
  },
  [OrderEnum.CONFIRMED]: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  [OrderEnum.SHIPPED]: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Truck,
  },
  [OrderEnum.OUTFORDELIVERY]: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Truck,
  },
  [OrderEnum.DELIVERED]: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle,
  },
};

const OrdersDashboard: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<OrderEnum | "ALL">("ALL");
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const {
    orders,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useOrders({ status: statusFilter, search: searchTerm, limit: 10 });

  const getStatusStats = (): StatsData => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.Status === "PENDING").length,
      shipped: orders.filter((o) =>
        ["SHIPPED", "OUTFORDELIVERY"].includes(o.Status)
      ).length,
      delivered: orders.filter((o) => o.Status === "DELIVERED").length,
    };
  };

  const StatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({
    status,
    className = "",
  }) => {
    const statusConfig = orderStatuses[status];
    const IconComponent = statusConfig.icon;

    return (
      <Badge
        variant="outline"
        className={`${statusConfig.color} border flex items-center gap-1 px-2 py-1 text-xs font-medium ${className}`}
      >
        <IconComponent className="w-3 h-3" />
        <span className="hidden sm:inline">
          {status.replace("OUTFORDELIVERY", "OUT FOR DELIVERY")}
        </span>
        <span className="sm:hidden">
          {status === "OUTFORDELIVERY" ? "OUT" : status.slice(0, 4)}
        </span>
      </Badge>
    );
  };

  const OrderCard: React.FC<{ order: OrderDetails }> = ({ order }) => {
    const addressDetails: shippingInfo | undefined =
      selectedOrder?.ShippingAddress
        ? JSON.parse(selectedOrder?.ShippingAddress)
        : undefined;
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Image
                src={cloudinaryLoader({
                  src: order.FirstItemImage,
                  width: 12,
                })}
                alt={order.FirstItemName}
                className="w-12 h-12 rounded-lg object-cover"
                width={12}
                height={12}
              />
              <div>
                <p className="font-semibold text-sm"> {order.FirstItemName}</p>
                <p className="text-xs text-gray-600 truncate max-w-32">
                  {order.OrderId}
                </p>
              </div>
            </div>
            <StatusBadge status={order.Status} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium truncate ml-2">
                {addressDetails?.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium truncate ml-2">{order.Email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(order.TotalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span>
                {order.Items.length} item{order.Items.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-xs">{formatDate(order.CreatedAt)}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => {
              setSelectedOrder(order);
              setIsOrderDetailOpen(true);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  const OrderDetailDialog: React.FC = () => {
    if (!selectedOrder) return null;
    const addressDetails: shippingInfo | undefined =
      selectedOrder?.ShippingAddress
        ? JSON.parse(selectedOrder?.ShippingAddress)
        : undefined;
    return (
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">
                  Order Details
                </DialogTitle>
                <p className="text-gray-600 text-sm">{selectedOrder.OrderId}</p>
              </div>
              <StatusBadge status={selectedOrder.Status} />
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Created: {formatDate(selectedOrder.CreatedAt)}</p>
                  <p>Last Updated: {formatDate(selectedOrder.UpdatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{addressDetails?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedOrder.Email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-sm">{addressDetails?.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              {addressDetails ? (
                <CardContent>
                  <AddressForm {...addressDetails} />
                </CardContent>
              ) : null}
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="gap-3">
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedOrder.Items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Image
                        src={cloudinaryLoader({
                          src: selectedOrder.FirstItemImage,
                          width: 12,
                        })}
                        alt={item.Name}
                        className="w-12 h-12 sm:w-15 sm:h-15 rounded-lg object-cover flex-shrink-0"
                        width={12}
                        height={12}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">
                          {item.Name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          ID: {item.ProductId}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.Quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(item.Price)}
                        </p>
                        <p className="text-xs text-gray-600">each</p>
                        <p className="font-bold text-sm text-green-600">
                          {formatCurrency(item.Price * item.Quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Amount:</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">
                      {formatCurrency(selectedOrder.TotalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-2 py-3 flex items-center justify-between">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        </div>
        <a
          href="https://app.shiprocket.in/seller/orders/new?sku=&order_ids=&order_status=&channel_id=&payment_method=&pickup_address_id=&delivery_country=&quantity=&is_order_verified=&ship_weight=&previously_cancelled="
          target="_blank"
          className="flex items-center gap-1 border rounded-sm p-1 text-sm"
        >
          Go To Shiprocket <ArrowRight />
        </a>
      </div>

      <div className="p-2 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Orders Management
              </h1>
              <a
                href="https://app.shiprocket.in/seller/orders/new?sku=&order_ids=&order_status=&channel_id=&payment_method=&pickup_address_id=&delivery_country=&quantity=&is_order_verified=&ship_weight=&previously_cancelled="
                target="_blank"
                className="flex bg-primary text-secondary items-center gap-1 border rounded-sm p-2 text-sm"
              >
                Go To Shiprocket <ArrowRight />
              </a>
            </div>

            <p className="text-gray-600">Track and manage customer orders</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Total</p>
                    <p className="text-lg lg:text-2xl font-bold">
                      {stats.total}
                    </p>
                  </div>
                  <Package className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Pending</p>
                    <p className="text-lg lg:text-2xl font-bold text-yellow-600">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">Shipped</p>
                    <p className="text-lg lg:text-2xl font-bold text-purple-600">
                      {stats.shipped}
                    </p>
                  </div>
                  <Truck className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600">
                      Delivered
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-green-600">
                      {stats.delivered}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <Card className="mb-6 hidden md:block">
            <CardContent className="p-4 lg:p-6">
              <div className="hidden lg:flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by Order ID, Email, or Product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as OrderEnum | "ALL")
                  }
                >
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    {Object.keys(orderStatuses).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("OUTFORDELIVERY", "OUT FOR DELIVERY")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg lg:text-xl font-semibold">
                  Orders ({orders.length})
                </h2>
                <Button
                  onClick={refresh}
                  disabled={refreshing}
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    aria-label="Open filter menu"
                  >
                    <Filter className="w-5 h-5 text-gray-600" />
                    {/* Badge indicator for active filters */}
                    {(searchTerm || statusFilter !== "ALL") && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-80 sm:w-96 flex flex-col bg-white shadow-xl border-l border-gray-200 p-2"
                >
                  <SheetHeader className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <SheetTitle className="text-lg font-semibold text-gray-900">
                          Filter Orders
                        </SheetTitle>
                        <SheetDescription className="text-sm text-gray-500 mt-1">
                          Search and filter your orders to find what you need
                        </SheetDescription>
                      </div>
                      {/* Clear filters button */}
                      {(searchTerm || statusFilter !== "ALL") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("ALL");
                          }}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-6 space-y-6">
                    {/* Search Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">
                        Search Orders
                      </label>
                      <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          placeholder="Search by order ID, customer name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                          aria-describedby="search-help"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Clear search"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p id="search-help" className="text-xs text-gray-500">
                        Search across order details, customer info, and more
                      </p>
                    </div>

                    {/* Status Filter Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block">
                        Filter by Status
                      </label>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                          setStatusFilter(value as OrderEnum | "ALL")
                        }
                      >
                        <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="ALL" className="font-medium">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                              All Statuses
                            </div>
                          </SelectItem>
                          {Object.entries(orderStatuses).map(
                            ([status, config]) => (
                              <SelectItem key={status} value={status}>
                                <div className="flex items-center">
                                  <div
                                    className={`w-2 h-2 rounded-full mr-2 ${
                                      config?.color || "bg-gray-400"
                                    }`}
                                  />
                                  <p>
                                    {status
                                      .replace(
                                        "OUTFORDELIVERY",
                                        "OUT FOR DELIVERY"
                                      )
                                      .trim()
                                      .toUpperCase()}
                                  </p>
                                </div>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Active Filters Summary */}
                    {(searchTerm || statusFilter !== "ALL") && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-blue-900">
                          Active Filters
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {searchTerm && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Search: &quot;{searchTerm}&quot;
                              <button
                                onClick={() => setSearchTerm("")}
                                className="ml-1 hover:text-blue-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {statusFilter !== "ALL" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Status:{" "}
                              {statusFilter.replace(
                                "OUTFORDELIVERY",
                                "OUT FOR DELIVERY"
                              )}
                              <button
                                onClick={() => setStatusFilter("ALL")}
                                className="ml-1 hover:text-blue-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer with actions */}
                  <div className="border-t border-gray-100 pt-4 pb-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {orders.length !== undefined &&
                          `${orders.length} order${
                            orders.length !== 1 ? "s" : ""
                          } found`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xs px-3 py-1 h-auto"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Mobile Order Cards */}
            <div className="lg:hidden space-y-4">
              <ApiWrapper loading={loading} error={error} data={orders?.length}>
                <InfiniteScroll
                  hasMore={hasMore}
                  loadMore={loadMore}
                  loading={loadingMore}
                >
                  {orders.map((order) => (
                    <OrderCard key={order.OrderId} order={order} />
                  ))}
                </InfiniteScroll>
              </ApiWrapper>
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              {!hasMore && orders.length > 0 && (
                <div className="text-center text-sm py-8 text-gray-500">
                  No more orders to load
                </div>
              )}
              {orders.length === 0 && !loading && (
                <div className="hidden md:block text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <ApiWrapper
                          loading={loading}
                          error={error}
                          data={orders?.length}
                        >
                          <InfiniteScroll
                            hasMore={hasMore}
                            loadMore={loadMore}
                            loading={loadingMore}
                          >
                            {orders.map((order) => {
                              const addressDetails: shippingInfo | undefined =
                                order?.ShippingAddress
                                  ? JSON.parse(order?.ShippingAddress)
                                  : undefined;
                              return (
                                <tr
                                  key={order.OrderId}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <Image
                                        src={cloudinaryLoader({
                                          src: order.FirstItemImage,
                                          width: 10,
                                        })}
                                        alt={order.FirstItemName}
                                        className="w-10 h-10 rounded object-cover"
                                        width={10}
                                        height={10}
                                      />
                                      <div>
                                        <p className="font-medium text-sm">
                                          {order.FirstItemName}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate max-w-32">
                                          {order.OrderId}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <p className="font-medium text-sm">
                                        {addressDetails?.fullName}
                                      </p>
                                      <p className="font-medium text-sm text-gray-600">
                                        {order.Email}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                      {order.Items.length} item
                                      {order.Items.length > 1 ? "s" : ""}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap font-medium text-sm">
                                    {formatCurrency(order.TotalAmount)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={order.Status} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                                    {formatDate(order.CreatedAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setIsOrderDetailOpen(true);
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </InfiniteScroll>
                        </ApiWrapper>
                      </tbody>
                    </table>
                  </div>
                  {loadingMore && (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!hasMore && orders.length > 0 && (
                    <div className="text-center text-sm py-8 text-gray-500">
                      No more orders to load
                    </div>
                  )}
                  {orders.length === 0 && !loading && (
                    <div className="hidden md:block text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No orders found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mobile Empty State */}
            {orders.length === 0 && (
              <div className="lg:hidden text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderDetailDialog />
    </div>
  );
};

export default OrdersDashboard;
