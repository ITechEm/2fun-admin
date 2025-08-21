import { mongooseConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  await mongooseConnect();
  const { user } = await getServerSession(req, res, authOptions);

  if (req.method === "GET") {
    const { id } = req.query;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    const { status, trackOrder } = req.body;

    try {
      const updateFields = {};

      if (status) {
        updateFields.status = status;
      }

      if (trackOrder !== undefined) {
        updateFields.trackOrder = trackOrder;
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating order" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    try {
      const deletedOrder = await Order.findByIdAndDelete(id);

      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deleting order" });
    }
  }
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
