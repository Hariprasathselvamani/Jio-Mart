import Order from "../models/order.js";
import Product from "../models/product.js";
import stripe from "stripe";
import User from "../models/User.js";

// Place Order COD
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, addressId } = req.body;

    // Validate data
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User not authenticated" });
    if (!addressId)
      return res
        .status(400)
        .json({ success: false, message: "Address is required" });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart items are required" });
    }

    // Calculate total amount
    let amount = 0;
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      amount += product.offerPrice * item.quantity;
    }

    // Add 2% tax
    amount += Math.floor(amount * 0.02);

    // Create order
    const order = await Order.create({
      userId,
      items,
      amount,
      address: addressId,
      paymentType: "COD",
    });

    return res
      .status(201)
      .json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.error("Order Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Try again later." });
  }
};
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, addressId } = req.body;
    const { origin } = req.headers;

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User not authenticated" });
    if (!addressId)
      return res
        .status(400)
        .json({ success: false, message: "Address is required" });
    if (!items || !Array.isArray(items) || items.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Cart items are required" });

    let productData = [];
    let amount = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      amount += product.offerPrice * item.quantity;
    }

    // Add 2% tax
    amount += Math.floor(amount * 0.02);

    // Create order in DB
    const order = await Order.create({
      userId,
      items,
      amount,
      address: addressId,
      paymentType: "Online",
    });

    // Initialize Stripe
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Correct line_items format
    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
      },
      quantity: item.quantity,
    }));

    // Create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.status(201).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Stripe webhooks to Verify Payments Action : /stripe

export const stripwebhooks = async (req, res) => {
  console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sign = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sign,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    //Handle the Event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentintent = event.data.object;
        const paymentintentId = paymentintent.id;

        //Getting Session MetaData
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentintentId,
        });

        const { orderId, userId } = session.data[0].metadata;

        //Mark Payment As paid
        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        //clear user Cart
        await User.findByIdAndUpdate(userId, { cartItems: {} });
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentintent = event.data.object;
        const paymentintentId = paymentintent.id;

        //Getting Session MetaData
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentintentId,
        });

        const { orderId } = session.data[0].metadata;
        await Order.findOneAndDelete(orderId);
        break;
      }

      default:
        console.error(`Unhandled event type ${event.type}`);
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).send("Webhook handler error");
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const orders = await Order.find({ userId })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
