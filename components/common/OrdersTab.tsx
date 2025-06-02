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
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Edit3,
  Eye,
  Filter,
  MapPin,
  Package,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

// Types
interface OrderItem {
  ProductId: string;
  Quantity: number;
  Price: number;
  Name: string;
}

interface Order {
  OrderId: string;
  UserId: string;
  Items: OrderItem[];
  TotalAmount: number;
  ShippingAddress: string;
  Status: OrderStatus;
  CreatedAt: string;
  UpdatedAt: string;
  Email: string;
  FirstItemName: string;
  FirstItemImage: string;
}

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

interface PaginationInfo {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Mock data generator
const generateMockOrders = (): Order[] => [
  {
    OrderId: "ORD-2024-001",
    UserId: "user-123",
    Items: [
      {
        ProductId: "prod-1",
        Quantity: 2,
        Price: 29.99,
        Name: "Wireless Headphones",
      },
      { ProductId: "prod-2", Quantity: 1, Price: 49.99, Name: "Phone Case" },
    ],
    TotalAmount: 109.97,
    ShippingAddress: "123 Main St, New York, NY 10001",
    Status: "DELIVERED",
    CreatedAt: "2024-05-28T10:30:00Z",
    UpdatedAt: "2024-05-30T14:22:00Z",
    Email: "john.doe@email.com",
    FirstItemName: "Wireless Headphones",
    FirstItemImage: "https://via.placeholder.com/60x60?text=WH",
  },
  {
    OrderId: "ORD-2024-002",
    UserId: "user-456",
    Items: [
      { ProductId: "prod-3", Quantity: 1, Price: 199.99, Name: "Smart Watch" },
    ],
    TotalAmount: 199.99,
    ShippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
    Status: "SHIPPED",
    CreatedAt: "2024-05-29T15:45:00Z",
    UpdatedAt: "2024-06-01T09:15:00Z",
    Email: "jane.smith@email.com",
    FirstItemName: "Smart Watch",
    FirstItemImage: "https://via.placeholder.com/60x60?text=SW",
  },
  {
    OrderId: "ORD-2024-003",
    UserId: "user-789",
    Items: [
      { ProductId: "prod-4", Quantity: 3, Price: 15.99, Name: "USB Cable" },
      {
        ProductId: "prod-5",
        Quantity: 1,
        Price: 89.99,
        Name: "Wireless Mouse",
      },
      {
        ProductId: "prod-6",
        Quantity: 2,
        Price: 24.99,
        Name: "Screen Protector",
      },
    ],
    TotalAmount: 187.95,
    ShippingAddress: "789 Pine St, Chicago, IL 60601",
    Status: "CONFIRMED",
    CreatedAt: "2024-06-01T08:20:00Z",
    UpdatedAt: "2024-06-01T16:30:00Z",
    Email: "mike.johnson@email.com",
    FirstItemName: "USB Cable",
    FirstItemImage: "https://via.placeholder.com/60x60?text=UC",
  },
  {
    OrderId: "ORD-2024-004",
    UserId: "user-321",
    Items: [
      {
        ProductId: "prod-7",
        Quantity: 1,
        Price: 299.99,
        Name: "Bluetooth Speaker",
      },
    ],
    TotalAmount: 299.99,
    ShippingAddress: "321 Elm St, Miami, FL 33101",
    Status: "PENDING",
    CreatedAt: "2024-06-02T12:10:00Z",
    UpdatedAt: "2024-06-02T12:10:00Z",
    Email: "sarah.wilson@email.com",
    FirstItemName: "Bluetooth Speaker",
    FirstItemImage: "https://via.placeholder.com/60x60?text=BS",
  },
  {
    OrderId: "ORD-2024-005",
    UserId: "user-555",
    Items: [
      {
        ProductId: "prod-8",
        Quantity: 1,
        Price: 79.99,
        Name: "Gaming Mouse Pad",
      },
    ],
    TotalAmount: 79.99,
    ShippingAddress: "555 Broadway, Seattle, WA 98101",
    Status: "OUTFORDELIVERY",
    CreatedAt: "2024-06-01T14:30:00Z",
    UpdatedAt: "2024-06-02T10:45:00Z",
    Email: "alex.brown@email.com",
    FirstItemName: "Gaming Mouse Pad",
    FirstItemImage: "https://via.placeholder.com/60x60?text=MP",
  },
  {
    OrderId: "ORD-2024-006",
    UserId: "user-666",
    Items: [
      { ProductId: "prod-9", Quantity: 2, Price: 24.99, Name: "Phone Charger" },
    ],
    TotalAmount: 49.98,
    ShippingAddress: "666 Market St, San Francisco, CA 94102",
    Status: "PAID",
    CreatedAt: "2024-06-02T09:15:00Z",
    UpdatedAt: "2024-06-02T09:15:00Z",
    Email: "emma.davis@email.com",
    FirstItemName: "Phone Charger",
    FirstItemImage: "https://via.placeholder.com/60x60?text=PC",
  },
  {
    OrderId: "ORD-2024-007",
    UserId: "user-777",
    Items: [
      {
        ProductId: "prod-10",
        Quantity: 1,
        Price: 89.99,
        Name: "Wireless Keyboard",
      },
    ],
    TotalAmount: 89.99,
    ShippingAddress: "777 Pine Ave, Boston, MA 02101",
    Status: "CONFIRMED",
    CreatedAt: "2024-06-01T16:20:00Z",
    UpdatedAt: "2024-06-02T08:30:00Z",
    Email: "robert.taylor@email.com",
    FirstItemName: "Wireless Keyboard",
    FirstItemImage: "https://via.placeholder.com/60x60?text=WK",
  },
  {
    OrderId: "ORD-2024-008",
    UserId: "user-888",
    Items: [
      { ProductId: "prod-11", Quantity: 2, Price: 39.99, Name: "USB Hub" },
    ],
    TotalAmount: 79.98,
    ShippingAddress: "888 Oak St, Denver, CO 80201",
    Status: "SHIPPED",
    CreatedAt: "2024-06-01T11:15:00Z",
    UpdatedAt: "2024-06-02T13:45:00Z",
    Email: "lisa.martinez@email.com",
    FirstItemName: "USB Hub",
    FirstItemImage: "https://via.placeholder.com/60x60?text=UH",
  },
  {
    OrderId: "ORD-2024-009",
    UserId: "user-999",
    Items: [
      {
        ProductId: "prod-12",
        Quantity: 1,
        Price: 149.99,
        Name: "Tablet Stand",
      },
    ],
    TotalAmount: 149.99,
    ShippingAddress: "999 Elm Ave, Phoenix, AZ 85001",
    Status: "PENDING",
    CreatedAt: "2024-06-02T14:30:00Z",
    UpdatedAt: "2024-06-02T14:30:00Z",
    Email: "david.lee@email.com",
    FirstItemName: "Tablet Stand",
    FirstItemImage: "https://via.placeholder.com/60x60?text=TS",
  },
  {
    OrderId: "ORD-2024-010",
    UserId: "user-101",
    Items: [
      {
        ProductId: "prod-13",
        Quantity: 3,
        Price: 19.99,
        Name: "Cable Organizer",
      },
    ],
    TotalAmount: 59.97,
    ShippingAddress: "101 Main Ave, Portland, OR 97201",
    Status: "DELIVERED",
    CreatedAt: "2024-05-30T09:00:00Z",
    UpdatedAt: "2024-06-01T17:20:00Z",
    Email: "maria.garcia@email.com",
    FirstItemName: "Cable Organizer",
    FirstItemImage: "https://via.placeholder.com/60x60?text=CO",
  },
];

const OrdersDashboard: React.FC = () => {
  const [orders] = useState<Order[]>(generateMockOrders());
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  const orderStatuses: Record<OrderStatus, OrderStatusConfig> = {
    PENDING: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    PAID: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CreditCard,
    },
    CONFIRMED: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    SHIPPED: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Truck,
    },
    OUTFORDELIVERY: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: Truck,
    },
    DELIVERED: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: CheckCircle,
    },
  };

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.OrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.FirstItemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((order) => order.Status === statusFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, orders]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const paginationInfo: PaginationInfo = {
    currentPage,
    itemsPerPage,
    totalItems: filteredOrders.length,
    totalPages,
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus): void => {
    if (selectedOrder && selectedOrder.OrderId === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        Status: newStatus,
        UpdatedAt: new Date().toISOString(),
      });
    }
  };

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

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
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

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={order.FirstItemImage}
              alt={order.FirstItemName}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="font-semibold text-sm">{order.OrderId}</p>
              <p className="text-xs text-gray-600 truncate max-w-32">
                {order.FirstItemName}
              </p>
            </div>
          </div>
          <StatusBadge status={order.Status} />
        </div>

        <div className="space-y-2 text-sm">
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

  const Pagination: React.FC<{ paginationInfo: PaginationInfo }> = ({
    paginationInfo,
  }) => {
    const { currentPage, totalPages, totalItems, itemsPerPage } =
      paginationInfo;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} orders
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const distance = Math.abs(page - currentPage);
                return (
                  distance === 0 ||
                  distance === 1 ||
                  page === 1 ||
                  page === totalPages
                );
              })
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="text-gray-400 text-sm px-2">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const OrderDetailDialog: React.FC = () => {
    if (!selectedOrder) return null;

    return (
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            {/* Order Status Update */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <Select
                    value={selectedOrder.Status}
                    onValueChange={(value: OrderStatus) =>
                      updateOrderStatus(selectedOrder.OrderId, value)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(orderStatuses).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("OUTFORDELIVERY", "OUT FOR DELIVERY")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Created: {formatDate(selectedOrder.CreatedAt)}</p>
                  <p>Last Updated: {formatDate(selectedOrder.UpdatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedOrder.Email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-medium text-sm">
                      {selectedOrder.UserId}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {selectedOrder.ShippingAddress}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
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
                        src={`https://via.placeholder.com/60x60?text=${item.Name.charAt(
                          0
                        )}`}
                        alt={item.Name}
                        className="w-12 h-12 sm:w-15 sm:h-15 rounded-lg object-cover flex-shrink-0"
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
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Orders Management
            </h1>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <h2 className="text-lg lg:text-xl font-semibold">
                Orders ({filteredOrders.length})
              </h2>
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
                        onValueChange={setStatusFilter}
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
                        {filteredOrders.length !== undefined &&
                          `${filteredOrders.length} order${
                            filteredOrders.length !== 1 ? "s" : ""
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
              {currentOrders.map((order) => (
                <OrderCard key={order.OrderId} order={order} />
              ))}
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
                        {currentOrders.map((order) => (
                          <tr key={order.OrderId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img
                                  src={order.FirstItemImage}
                                  alt={order.FirstItemName}
                                  className="w-10 h-10 rounded object-cover"
                                />
                                <div>
                                  <p className="font-medium text-sm">
                                    {order.OrderId}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate max-w-32">
                                    {order.FirstItemName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="font-medium text-sm">
                                  {order.Email}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {order.UserId}
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
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
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
            {filteredOrders.length === 0 && (
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

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <Pagination paginationInfo={paginationInfo} />
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <OrderDetailDialog />
    </div>
  );
};

export default OrdersDashboard;
