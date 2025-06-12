export enum OrderEnum {
  PENDING = "PENDING",
  PAID = "PAID",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  OUTFORDELIVERY = "OUTFORDELIVERY",
  DELIVERED = "DELIVERED",
}

export enum ShipRocketOrderEnum {
  TOTAL = "TOTAL",
  NEW = "NEW",
  SHIPPED = "SHIPPED",
  OUTFORDELIVERY = "OUTFORDELIVERY",
  DELIVERED = "DELIVERED",
}
export interface OrderItem {
  ProductId: string;
  Quantity: number;
  Price: number;
  Name: string;
}

export interface OrderDetails {
  OrderId: string;
  Status: OrderEnum;
  Items: OrderItem[];
  FirstItemImage: string;
  FirstItemName: string;
  ShippingAddress: string;
  TotalAmount: number;
  CreatedAt: string;
  UpdatedAt: string;
  ShiprocketOrderId: string;
  ShiprocketShipmentId: string;
  ShiprocketAwb: string;
  CourierName: string;
  Email: string;
  UserId: string;
}

export interface shippingInfo {
  id?: string;
  address?: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  fullName: string;
  phone: string;
}
