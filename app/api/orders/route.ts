import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { NextResponse } from "next/server";

const client = new DynamoDBClient({ region: "ap-south-1" });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const lastKey = searchParams.get("lastKey");

  let ExclusiveStartKey;
  if (lastKey) {
    try {
      ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
    } catch (e) {
      console.error("Invalid lastKey:", e);
      return NextResponse.json(
        { error: "Invalid pagination key" },
        { status: 400 }
      );
    }
  }

  const params: ScanCommandInput = {
    TableName: "Orders",
    Limit: limit,
    ExclusiveStartKey,
  };

  const filterExpressions = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, { S: string }> = {};

  if (status) {
    filterExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "Status";
    expressionAttributeValues[":status"] = { S: status };
  }

  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(" AND ");
    params.ExpressionAttributeNames = expressionAttributeNames;
    params.ExpressionAttributeValues = expressionAttributeValues;
  }

  try {
    const command = new ScanCommand(params);
    const response = await client.send(command);
    let orders = response.Items?.map((item) => unmarshall(item)) || [];

    if (search) {
      orders = orders.filter(
        (order) =>
          order.Email?.toLowerCase().includes(search) ||
          order.FirstItemName?.toLowerCase().includes(search)
      );
    }

    const nextKey = response.LastEvaluatedKey
      ? encodeURIComponent(JSON.stringify(response.LastEvaluatedKey))
      : null;

    return NextResponse.json({
      orders,
      nextKey,
      hasMore: nextKey ? true : false,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
