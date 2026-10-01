import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createChat, getChats, getMessages, updateChatQuantity, deleteChat } from "../controller/chat.controller.js";

const router = express.Router();

router.post("/create", protect, createChat);
router.get("/all", protect, getChats);
router.get("/messages/:chatId", protect, getMessages);
router.patch("/update-quantity/:chatId", protect, updateChatQuantity);
router.delete("/delete/:chatId", protect, deleteChat);

export default router;