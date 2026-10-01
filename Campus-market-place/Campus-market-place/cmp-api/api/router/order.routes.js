import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createOrder, markAsSold, getMyOrders, getMyPurchases, getMySales } from "../controller/order.controller.js";

const router = express.Router();

router.post("/create", protect, createOrder);
router.post("/mark-as-sold", protect, markAsSold);   // NEW — seller initiates
router.get("/my-orders", protect, getMyOrders);
router.get("/my-purchases", protect, getMyPurchases);
router.get("/my-sales", protect, getMySales);

export default router;