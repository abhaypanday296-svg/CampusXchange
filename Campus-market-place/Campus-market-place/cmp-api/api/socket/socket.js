import { Message } from "../models/message.schema.js";
import { Chat } from "../models/chat.schema.js";

const onlineUsers = new Map();
let _io = null;

// Dashboard real-time update ke liye
export const emitOrderCreated = (sellerId, buyerId) => {
  if (!_io) return;
  _io.emit("order_created", { sellerId, buyerId });
};

export const setupSocket = (io) => {
  _io = io;

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("user_online", (userId) => {
      if (!userId) return;
      if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
      onlineUsers.get(userId).add(socket.id);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send_message", async (data) => {
      const { chatId, sender, text } = data;
      try {
        const newMessage = new Message({ chatId, sender, text });
        await newMessage.save();
        await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });
        const populatedMessage = await Message.findById(newMessage._id).populate("sender", "username");
        io.to(chatId).emit("receive_message", populatedMessage);
      } catch (error) {
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};