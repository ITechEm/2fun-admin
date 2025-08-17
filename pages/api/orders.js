// pages/api/orders.js

import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === "GET") {
    try {
      const orders = await Order.find({});
      return res.status(200).json(orders); // Return all orders
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching orders" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
