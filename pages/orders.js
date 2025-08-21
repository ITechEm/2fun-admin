import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Spinner from "@/components/Spinner";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emailQuery, setEmailQuery] = useState("");
  const [editedTracking, setEditedTracking] = useState({});
  const [newTracking, setNewTracking] = useState({});

  const statusOptions = [
    "Cancelled",
    "Pending",
    "In Progress",
    "In Delivery",
    "Delivered",
  ];

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/orders");
      console.log("Fetched Orders:", response.data);

      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (emailQuery === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.email?.toLowerCase().includes(emailQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [emailQuery, orders]);

  const handleTrackingNumberSave = async (orderId, trackingNumber) => {
    if (!trackingNumber) {
      return Swal.fire({
        title: "Error!",
        text: "Tracking number cannot be empty.",
        icon: "error",
      });
    }

    try {
      await axios.put(`/api/orders/${orderId}`, { trackOrder: trackingNumber });
      Swal.fire({
        title: "Success!",
        text: "Tracking number updated.",
        icon: "success",
      });
      setEditedTracking((prev) => ({ ...prev, [orderId]: false }));
      setNewTracking((prev) => ({ ...prev, [orderId]: "" }));
      fetchOrders();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "There was an issue updating the tracking number. Please try again.",
        icon: "error",
      });
    }
  };

  const handleTrackingNumberDelete = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to remove the tracking number?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#3085d6",
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!",
      });

      if (result.isConfirmed) {
        await axios.put(`/api/orders/${orderId}`, { trackOrder: "" });
        Swal.fire({
          title: "Removed!",
          text: "Tracking number has been removed.",
          icon: "success",
        });
        setEditedTracking((prev) => ({ ...prev, [orderId]: false }));
        setNewTracking((prev) => ({ ...prev, [orderId]: "" }));
        fetchOrders();
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "There was an issue removing the tracking number. Please try again.",
        icon: "error",
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      Swal.fire({
        title: "Status Updated!",
        text: `The status has been successfully updated to "${newStatus}".`,
        icon: "success",
      });
    } catch (error) {
      console.error("Error details:", error.response || error.message || error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "There was an error updating the status. Please try again.",
        icon: "error",
      });
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Cancelled": return "bg-red-500 text-white";
      case "Pending": return "bg-yellow-400 text-black";
      case "In Progress": return "bg-blue-400 text-white";
      case "Ready for Delivery": return "bg-green-300 text-black";
      case "In Delivery": return "bg-green-400 text-black";
      case "Delivered": return "bg-green-700 text-white";
      default: return "bg-gray-200 text-black";
    }
  };

  const isNewOrder = (orderDate) => {
    const now = new Date();
    const orderCreated = new Date(orderDate);
    const diffInHours = (now - orderCreated) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const deleteOrder = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this order?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#3085d6",
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`/api/orders/${orderId}`);
        
        if (response.status === 200) {
          Swal.fire({
            title: "Deleted!",
            text: "The order has been deleted.",
            icon: "success",
          });
          setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
        }
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire({
        title: "Error!",
        text: "There was an issue deleting the order. Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <Layout>
      <h1>Orders</h1>

      <div className="mb-4">
        <input
          type="text"
          value={emailQuery}
          onChange={(e) => setEmailQuery(e.target.value)}
          placeholder="Search by email"
          className="border p-2 rounded w-1/3"
        />
      </div>
      <table className="basic w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Order Number</th>
            <th>Recipient</th>
            <th>Products</th>
            <th>Paid</th>
            <th>Status</th>
            <th>Tracking Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={8}>
                <div className="py-4">
                  <Spinner fullWidth={true} />
                </div>
              </td>
            </tr>
          )}
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <tr style={{ borderBottom: '2px solid #ddd' }} key={order._id}>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.orderNumber}
                  {isNewOrder(order.createdAt) && (
                    <span
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        marginLeft: '10px',
                      }}
                    >
                      NEW
                    </span>
                  )}
                </td>
                <td>
                  {order.name}
                  <br />
                  <strong>{order.email}</strong>
                  <br />
                  {order.city} {order.postalCode} {order.country}
                  <br />
                  {order.streetAddress}
                </td>
                <td className="overflow-hidden">
                  {order.line_items.length > 4 ? (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {order.line_items.map((l, i) => (
                        <div key={i}>
                          <strong>{l.price_data?.product_data.name}</strong> x {l.quantity}
                        </div>
                      ))}
                    </div>
                  ) : (
                    order.line_items.map((l, i) => (
                      <div key={i}>
                        <strong>{l.price_data?.product_data.name}</strong> x {l.quantity}
                      </div>
                    ))
                  )}
                </td>
                <td className={order.paid ? "text-green-600" : "text-red-600"}>{order.paid ? "✔️" : "❌"}</td>
                <td>
                  <select
                    value={order.status || "Pending"}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`border p-1 rounded text-sm w-32 ${getStatusClass(order.status || "Pending")}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {editedTracking[order._id] ? (
                    <>
                      <input
                        type="text"
                        placeholder="Tracking Number"
                        value={newTracking[order._id] || order.trackOrder || ""}
                        onChange={(e) => setNewTracking((prev) => ({ ...prev, [order._id]: e.target.value }))}
                        className="border p-1 rounded text-sm w-32"
                      />
                      <br />
                      <button
                        onClick={() => handleTrackingNumberSave(order._id, newTracking[order._id])}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        💾
                      </button>
                      <button
                        onClick={() => setEditedTracking({ ...editedTracking, [order._id]: false })}
                        className="text-gray-600 hover:text-gray-800 ml-2"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="border p-1 rounded text-sm w-32">{order.trackOrder || "No Tracking Number"}</span>
                      <br />
                      <button
                        onClick={() => setEditedTracking({ ...editedTracking, [order._id]: true })}
                        className="mt-2  text-white p-2 rounded"
                      >
                        ✏️
                      </button>
                      {order.trackOrder && (
                        <button
                          onClick={() => handleTrackingNumberDelete(order._id)}
                          className="mt-2 ml-2 text-white p-2 rounded"
                        >
                          🗑️
                        </button>
                      )}
                      {!order.trackOrder && (
                        <button
                          onClick={() => setEditedTracking({ ...editedTracking, [order._id]: true })}
                          className="text-blue-600 hover:text-blue-800 ml-2 rounded"
                        >
                          ➕
                        </button>
                      )}
                    </>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Layout>
  );
}