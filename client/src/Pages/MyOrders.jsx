import React, { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import toast from "react-hot-toast";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user", {
        // <-- use /user
        withCredentials: true,
      });

      if (data.success) {
        setMyOrders(data.orders || []);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Fetch my orders error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error fetching orders"
      );
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="mt-16 text-center">
        <p className="text-xl font-medium">Please login to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="mt-16 pb-16">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-16 h-0.5 bg-primary-dull rounded-full"></div>
      </div>

      {myOrders.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-2xl font-medium text-primary-dull">
            You have no orders yet.
          </p>
        </div>
      ) : (
        myOrders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl"
          >
            <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col">
              <span>OrderId: {order._id}</span>
              <span>Payment: {order.paymentType || "N/A"}</span>
              <span>
                Total Amount: {currency} {order.amount || 0}
              </span>
            </p>

            {Array.isArray(order.items) &&
              order.items.map((item, index) => (
                <div
                  key={index}
                  className={`relative bg-white text-gray-500/70 ${
                    order.items.length !== index + 1 ? "border-b" : ""
                  } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}
                >
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-primary-dull/10 p-4 rounded-lg">
                      <img
                        src={item.product?.images?.[0] || "/placeholder.png"}
                        alt={item.product?.name || "Product"}
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-medium text-gray-800">
                        {item.product?.name || "Unknown Product"}
                      </h2>
                      <p>Category: {item.product?.category || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
                    <p>Quantity: {item.quantity || 1}</p>
                    <p>Status: {order.status || "Pending"}</p>
                    <p>
                      Date:{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <p className="text-primary-dull text-lg font-medium">
                    Amount: {currency}{" "}
                    {item.product
                      ? (item.product.offerPrice || item.product.price) *
                        item.quantity
                      : 0}
                  </p>
                </div>
              ))}
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
