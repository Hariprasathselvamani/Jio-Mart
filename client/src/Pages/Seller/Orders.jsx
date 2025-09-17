import React, { useEffect, useState } from "react";
import { useAppContext } from "../../Context/AppContext";
import assets, { dummyOrders } from "../../assets/assets";
import toast from "react-hot-toast";

const Orders = () => {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);

  const fetchMyOrders = async () => {
    try {
      // Check if axios is available
      if (!axios) {
        console.error("Axios is not defined or not available.");
        return;
      }

      // Call the correct endpoint for sellers and include authentication credentials
      const { data } = await axios.get("/api/order/seller", {
        withCredentials: true,
      });

      if (data.success) {
        // Set the fetched orders to your state
        setOrders(data.orders || []);
      } else {
        // Show an error toast if the request was successful but the backend returned an error
        toast.error(data.message || "Failed to fetch seller orders.");
      }
    } catch (error) {
      // Log and display a more detailed error message for failed requests
      console.error("Fetch seller orders error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred while fetching orders."
      );
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);
  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>
        {orders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col md:items-center md:flex-row gap-5  justify-between p-5 max-w-4xl rounded-md border border-gray-300"
          >
            <div className="flex gap-5 max-w-80">
              <img
                className="w-12 h-12 object-cover "
                src={assets.box_icon}
                alt="boxIcon"
              />
              <div>
                {order.items?.map((item, index) => (
                  <div key={index} className="flex flex-col">
                    <p className="font-medium">
                      {item.product?.name}{" "}
                      <span className="text-primary-dull">
                        x {item.quantity ?? 0}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm md:text-base text-black/60">
              <p className="font-medium mb-1">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>
                {order.address.street}, {order.address.city}
              </p>{" "}
              <p>
                {order.address.state},{order.address.zipcode},{" "}
                {order.address.country}
              </p>
              <p></p>
              <p>{order.address.phone}</p>
            </div>

            <p className="font-medium text-lg my-auto">
              {currency}
              {order.amount}
            </p>

            <div className="flex flex-col text-sm">
              <p>Method: {order.paymentType}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Orders;
