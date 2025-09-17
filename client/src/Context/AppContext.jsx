import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Global Axios settings
axios.defaults.withCredentials = true; // send cookies automatically
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [user, setUser] = useState(null);
  const [isSeller, setISeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]); // always an array
  const [searchQuery, setSearchQuery] = useState({});

  // Fetch logged-in user
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || []);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  // Fetch seller info
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setISeller(data.success);
    } catch (error) {
      setISeller(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add product to cart
  const addToCart = (itemId) => {
    const index = cartItems.findIndex((i) => i._id === itemId);
    const newCart = [...cartItems];

    if (index !== -1) {
      newCart[index] = {
        ...newCart[index],
        quantity: newCart[index].quantity + 1,
      };
    } else newCart.push({ _id: itemId, quantity: 1 });

    setCartItems(newCart);
    toast.success("Added to Cart");
  };

  // Update cart item quantity
  const updateCartItem = (itemId, quantity) => {
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    const newCart = cartItems.map((item) =>
      item._id === itemId ? { ...item, quantity } : item
    );
    setCartItems(newCart);
    toast.success("Cart Updated");
  };

  // Remove product from cart
  const removeFromCart = (itemId) => {
    const newCart = cartItems
      .map((item) =>
        item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    setCartItems(newCart);
    toast.success("Removed from Cart");
  };

  // Get total items in cart
  const getCartCount = () =>
    cartItems.reduce((sum, item) => {
      if (!item || !item._id || !item.quantity) return sum; // ✅ ignore invalid items
      return sum + item.quantity;
    }, 0);

  // Get total cart amount
  const getCartAmount = () =>
    cartItems.reduce((total, item) => {
      const product = products.find((p) => p._id === item._id);
      return product ? total + product.offerPrice * item.quantity : total;
    }, 0);

  // Update cart in backend whenever cartItems change
  useEffect(() => {
    const updateCart = async () => {
      if (!user) return;
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (!data.success) toast.error(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    };
    updateCart();
  }, [cartItems, user]);

  // Fetch initial data
  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setISeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    setCartItems,
    fetchProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
