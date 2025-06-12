import { apiResponse } from "@/lib/apiClient";
import { getShiprocketToken } from "@/lib/shiprocket";
import axios from "axios";
import { NextResponse } from "next/server";

const STATUS_CODES = {
  NEW: 1,
  DELIVERED: 7,
  SHIPPED: 6,
  OUT_FOR_DELIVERY: 19,
  TOTAL: "TOTAL",
} as const;

async function fetchStatusCount(statusCode: number | string, token: string) {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...(statusCode !== STATUS_CODES.TOTAL && {
      params: {
        filter_by: "status",
        filter: statusCode,
      },
    }),
  };

  const res = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/orders`,
    config
  );

  const data = res.data;
  return data.meta?.pagination?.total || 0;
}

export async function GET() {
  try {
    const token = await getShiprocketToken();

    if (token) {
      const [delivered, shipped, newOrders, outForDelivery, total] =
        await Promise.all([
          fetchStatusCount(STATUS_CODES.DELIVERED, token),
          fetchStatusCount(STATUS_CODES.SHIPPED, token),
          fetchStatusCount(STATUS_CODES.NEW, token),
          fetchStatusCount(STATUS_CODES.OUT_FOR_DELIVERY, token),
          fetchStatusCount(STATUS_CODES.TOTAL, token),
        ]);

      return NextResponse.json(
        apiResponse({
          data: {
            deliveredOrders: delivered,
            shippedOrders: shipped,
            newOrders,
            outForDeliveryOrders: outForDelivery,
            totalOrders: total,
          },
          status: 200,
          success: true,
        })
      );
    }
  } catch (err) {
    console.error("Failed to fetch order stats", err);
    return NextResponse.json(
      apiResponse({
        success: false,
        error: "Something went wrong while getting order stats",
        status: 500,
      })
    );
  }
}
