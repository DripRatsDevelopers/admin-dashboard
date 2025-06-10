import { getShiprocketToken } from "@/lib/shiprocket";
import { NextResponse } from "next/server";

const STATUS_CODES = {
  DELIVERED: 11,
  SHIPPED: 7,
  PENDING: 1,
};

async function fetchStatusCount(statusCode: number, token: string) {
  const res = await fetch(
    `https://apiv2.shiprocket.in/v1/external/orders?status=${statusCode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  return data.meta?.pagination?.total || 0;
}

export async function GET() {
  const token = await getShiprocketToken();

  if (token) {
    const [delivered, shipped, pending] = await Promise.all([
      fetchStatusCount(STATUS_CODES.DELIVERED, token),
      fetchStatusCount(STATUS_CODES.SHIPPED, token),
      fetchStatusCount(STATUS_CODES.PENDING, token),
    ]);

    return NextResponse.json({
      totalOrders: delivered + shipped + pending,
      deliveredOrders: delivered,
      shippedOrders: shipped,
      pendingOrders: pending,
    });
  }
}
