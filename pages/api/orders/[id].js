import { mongooseConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  await mongooseConnect();
  const { user } = await getServerSession(req, res, authOptions);

  // GET request - Fetch specific order
  if (req.method === "GET") {
    const { id } = req.query; // Get the dynamic ID from the URL
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  }

  // PUT request - Update the status of an order
  if (req.method === "PUT") {
    const { id } = req.query; // Get the dynamic ID from the URL
    const { status } = req.body; // New status to update

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        id, // Use the order ID from the URL
        { status }, // Update the status field
        { new: true } // Return the updated order
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json(updatedOrder); // Send back the updated order
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating status" });
    }
  }

  // DELETE request - Delete the order
  if (req.method === "DELETE") {
    const { id } = req.query; // Get the dynamic ID from the URL

    try {
      const deletedOrder = await Order.findByIdAndDelete(id); // Delete the order

      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json({ message: "Order deleted successfully" }); // Send back success message
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deleting order" });
    }
  }

  // If method is not GET, PUT, or DELETE, return 405 Method Not Allowed
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}






// import {mongooseConnect} from "@/lib/mongoose";
// import {Order} from "@/models/Order";

// export default async function handler(req,res) {
//   await mongooseConnect();
//   res.json(await Order.find().sort({createdAt:-1}));
// }