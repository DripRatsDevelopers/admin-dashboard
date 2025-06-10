import { OrderDetails, OrderEnum } from "@/types/order";

interface IOrderInput {
  pageParam?: string;
  status: OrderEnum | "ALL";
  search?: string;
  limit: number;
}

interface OrdersResponse {
  orders: OrderDetails[];
  nextKey?: string;
  hasMore: boolean;
}

export const fetchOrders = async ({
  pageParam,
  status,
  search,
  limit,
}: IOrderInput): Promise<OrdersResponse> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  if (status && status !== "ALL") {
    params.append("status", status);
  }

  if (search) {
    params.append("search", search);
  }

  if (pageParam) {
    params.append("lastKey", pageParam);
  }
  const response = await fetch(`/api/orders?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
};
