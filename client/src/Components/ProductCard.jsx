import React from "react";
import assets from "../assets/assets";
import { useAppContext } from "../Context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext();

  if (!product) return null;

  // ✅ Fix cartItems lookup (since it's an array, not object)
  const cartItem = cartItems.find((item) => item._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // ✅ Safe category handling
  const handleNavigate = () => {
    if (!product._id) return console.error("Product ID missing");
    const category = encodeURIComponent(
      (product.category || "uncategorized").toLowerCase()
    );
    const id = encodeURIComponent(product._id); // very important
    navigate(`/products/${category}/${id}`);
    scrollTo(0, 0);
  };

  return (
    <div
      onClick={handleNavigate}
      className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full cursor-pointer"
    >
      {/* Product Image */}
      <div className="group flex items-center justify-center px-2">
        <img
          className="group-hover:scale-105 transition max-w-26 md:max-w-36"
          src={product.images?.[0] || assets.placeholder_images}
          alt={product.name || "product"}
        />
      </div>

      {/* Product Info */}
      <div className="text-gray-500/60 text-sm mt-2">
        <p>{product.category || "Uncategorized"}</p>
        <p className="text-gray-700 font-medium text-lg truncate w-full">
          {product.name || "Unnamed Product"}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-0.5">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                className="md:w-3.5 w-3"
                key={i}
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="star"
              />
            ))}
          <p>(4)</p>
        </div>

        {/* Price + Cart Buttons */}
        <div
          className="flex items-end justify-between mt-3"
          onClick={(e) => e.stopPropagation()} // ✅ Prevent parent navigate
        >
          <p className="md:text-xl text-base font-medium text-primary">
            {currency}
            {product.offerPrice ?? product.price}
            {product.offerPrice && (
              <span className="text-gray-500/60 md:text-sm text-xs line-through ml-1">
                {currency}
                {product.price}
              </span>
            )}
          </p>

          {quantity === 0 ? (
            <button
              type="button"
              className="flex items-center justify-center gap-1 bg-blue-500/10 border border-blue-500/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer text-primary-dull hover:bg-blue-500/20 transition"
              onClick={() => addToCart(product._id)}
            >
              <img src={assets.cart_icon} alt="cart-icon" className="w-4 h-4" />
              Add
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary rounded select-none text-indigo-900">
              <button
                onClick={() => removeFromCart(product._id)}
                className="cursor-pointer text-md px-2 h-full"
              >
                -
              </button>
              <span className="w-5 text-center">{quantity}</span>
              <button
                onClick={() => addToCart(product._id)}
                className="cursor-pointer text-md px-2 h-full"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
