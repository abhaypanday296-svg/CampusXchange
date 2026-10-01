import { Product } from "../models/product.js";
import { Order } from "../models/order.schema.js";
import { emitOrderCreated } from "../socket/socket.js";

// Create Order (buyer initiates)
export const createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const buyerId = req.user.id;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() === buyerId.toString()) {
      return res.status(400).json({ message: "You cannot buy your own product" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient product quantity" });
    }

    product.quantity -= quantity;
    if (product.quantity <= 0) product.inStock = false;
    await product.save();

    const totalAmount = product.price * quantity;

    const order = await Order.create({
      productId: product._id,
      sellerId: product.seller,
      buyerId,
      quantity,
      totalAmount,
    });

    emitOrderCreated(product.seller.toString(), buyerId.toString());

    return res.status(201).json({ message: "Order created successfully", data: order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Mark as Sold (seller initiates from chat) — NEW
export const markAsSold = async (req, res) => {
  try {
    const { productId, buyerId, quantity } = req.body;
    const sellerId = req.user.id; // JWT se seller confirm hota hai

    if (!productId || !buyerId || !quantity) {
      return res.status(400).json({ message: "productId, buyerId, quantity required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Verify seller
    if (product.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Only seller can mark as sold" });
    }

    // Buyer aur seller same nahi hone chahiye
    if (sellerId.toString() === buyerId.toString()) {
      return res.status(400).json({ message: "Buyer and seller cannot be same" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient product quantity" });
    }

    product.quantity -= quantity;
    if (product.quantity <= 0) product.inStock = false;
    await product.save();

    const totalAmount = product.price * quantity;

    const order = await Order.create({
      productId: product._id,
      sellerId,
      buyerId,
      quantity,
      totalAmount,
    });

    emitOrderCreated(sellerId.toString(), buyerId.toString());

    return res.status(201).json({
      message: "Marked as sold successfully",
      data: order,
      updatedProduct: { quantity: product.quantity, inStock: product.inStock },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Get My Purchases
export const getMyPurchases = async (req, res) => {
  try {
    const purchases = await Order.find({ buyerId: req.user.id })
      .populate("productId")
      .populate("sellerId", "username email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: purchases });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Get My Sales
export const getMySales = async (req, res) => {
  try {
    const sales = await Order.find({ sellerId: req.user.id })
      .populate("productId")
      .populate("buyerId", "username email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: sales });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Get All My Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
    })
      .populate("productId")
      .populate("sellerId", "username email")
      .populate("buyerId", "username email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: orders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};