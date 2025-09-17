import { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import assets from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    axios,
    user,
    setCartItems,
  } = useAppContext();
  const cartCount = getCartCount();

  const [showAddress, setShowAddress] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  // Build cartArray from cartItems
  useEffect(() => {
    const temp = cartItems
      .map((ci) => {
        const product = products.find((p) => p._id === ci._id);
        if (!product) return null;
        return { ...product, quantity: ci.quantity };
      })
      .filter(Boolean);
    setCartArray(temp);
  }, [products, cartItems]);

  // Fetch user addresses
  const getUserAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  // Place order
  const placeOrder = async () => {
    if (!selectedAddress || !selectedAddress._id) {
      toast.error("Please select a valid address");
      return;
    }
    if (!cartArray.length) {
      toast.error("Your cart is empty");
      return;
    }

    const orderPayload = {
      items: cartArray.map((item) => ({
        product: item._id,
        quantity: Number(item.quantity),
      })),
      addressId: selectedAddress._id,
    };

    try {
      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", orderPayload);
        if (data.success) {
          toast.success(data.message);
          setCartItems([]);
          navigate("/my-orders");
        } else toast.error(data.message || "Failed to place order");
      } else {
        const { data } = await axios.post("/api/order/stripe", orderPayload);
        if (data.success) window.location.replace(data.url);
        else toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Server error"
      );
    }
  };

  if (!products.length) return <p>Loading...</p>;

  return (
    <div className="flex flex-col md:flex-row mt-16 px-4 md:px-10 gap-6">
      {/* Cart Items */}
      <div className="flex-1 max-w-4xl space-y-4">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary-dull">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </span>
        </h1>

        {cartArray.length === 0 && <p>Your cart is empty</p>}

        {cartArray.map((product) => (
          <div
            key={product._id}
            className="flex flex-col md:flex-row items-center md:items-start gap-4 border border-gray-300 rounded-md p-4"
          >
            <div
              onClick={() => {
                navigate(
                  `/products/${product.category.toLowerCase()}/${product._id}`
                );

                scrollTo(0, 0);
              }}
              className="cursor-pointer w-24 h-24 flex items-center justify-center border rounded overflow-hidden"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-gray-500">
                  Weight: {product.weight || "N/A"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p>Qty:</p>
                  <select
                    value={product.quantity}
                    onChange={(e) =>
                      updateCartItem(product._id, Number(e.target.value))
                    }
                    className="border px-1 rounded outline-none"
                  >
                    {Array.from(
                      { length: Math.max(product.quantity, 9) },
                      (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="font-medium">
                  {currency}
                  {product.offerPrice * product.quantity}
                </p>
                <button onClick={() => removeFromCart(product._id)}>
                  <img
                    src={assets.remove_icon}
                    alt="remove"
                    className="w-6 h-6"
                  />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          className="group cursor-pointer flex items-center mt-4 gap-2 text-primary-dull font-medium"
          onClick={() => {
            navigate("/products");
            scrollTo(0, 0);
          }}
        >
          <img
            src={assets.arrow_right_icon_colored}
            alt="arrow"
            className="group-hover:-translate-x-1 transition"
          />
          Continue Shopping
        </button>
      </div>

      {/* Order Summary */}
      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 border border-gray-300 rounded-md">
        <h2 className="text-xl font-medium mb-4">Order Summary</h2>

        <div className="mb-4">
          <p className="font-medium uppercase text-sm">Delivery Address</p>
          <p className="text-gray-500 mt-1">
            {selectedAddress
              ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
              : "No Address Found"}
          </p>
          <button
            onClick={() => setShowAddress(!showAddress)}
            className="text-primary-dull hover:underline mt-1"
          >
            Change
          </button>
          {showAddress &&
            addresses.map((address, idx) => (
              <p
                key={idx}
                className="cursor-pointer p-1 hover:bg-gray-200"
                onClick={() => {
                  setSelectedAddress(address);
                  setShowAddress(false);
                }}
              >
                {address.street}, {address.city}, {address.state},{" "}
                {address.country}
              </p>
            ))}
        </div>

        <div className="mb-4">
          <p className="font-medium uppercase text-sm">Payment Method</p>
          <select
            value={paymentOption}
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1 outline-none"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <div className="text-gray-500 space-y-1">
          <p className="flex justify-between">
            <span>Price:</span>{" "}
            <span>
              {currency}
              {getCartAmount()}
            </span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee:</span>{" "}
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%):</span>{" "}
            <span>
              {currency}
              {(getCartAmount() * 2) / 100}
            </span>
          </p>
          <p className="flex justify-between font-medium mt-2">
            <span>Total:</span>{" "}
            <span>
              {currency}
              {getCartAmount() + (getCartAmount() * 2) / 100}
            </span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full mt-4 py-2 bg-primary-dull text-white font-medium rounded hover:bg-primary transition"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;
