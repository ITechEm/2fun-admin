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

  const statusOptions = [
    "Cancelled",
    "Pending",
    "In Progress",
    "In Delivery",
    "Delivered"
  ];

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/orders");
      console.log("Fetched Orders:", response.data);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchOrders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Sort orders by creation date
  useEffect(() => {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(sortedOrders);
  }, [orders]);

  // Filter orders based on emailQuery
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

  const deleteOrder = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#3085d6',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await axios.delete(`/api/orders/${orderId}`);
        Swal.fire({
          title: 'Deleted!',
          text: 'The order has been deleted.',
          icon: 'success',
        });
        setOrders((prevOrders) => prevOrders.filter(order => order._id !== orderId));
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an issue deleting the order. Please try again.',
        icon: 'error',
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
    return diffInHours <= 24; // Mark as "NEW" if the order was created in the last 24 hours
  };

  async function changeOrderStatus(order, newStatus) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change the status of this order to "${newStatus}"?`,
      showCancelButton: true,
      confirmButtonText: `Yes, change to "${newStatus}"!`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        handleStatusChange(order._id, newStatus);
      }
    });
  }

  return (
    <Layout>
      <h1>Orders</h1>
      
      {/* Search bar to filter orders by email */}
      <div className="mb-4">
        <input
          type="text"
          value={emailQuery}
          onChange={(e) => setEmailQuery(e.target.value)} // Update the email query
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={7}>
                <div className="py-4">
                  <Spinner fullWidth={true} />
                </div>
              </td>
            </tr>
          )}
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{new Date(order.createdAt).toLocaleString()}
                </td>
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
                <td className={order.paid ? "text-green-600" : "text-red-600"}>
                  {order.paid ? "✔️" : "❌"}
                </td>
                <td>
                  <select
                    value={order.status || "Pending"}
                    onChange={(e) => changeOrderStatus(order, e.target.value)}
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
              <td colSpan={7} className="text-center py-4">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Layout>
  );
}
