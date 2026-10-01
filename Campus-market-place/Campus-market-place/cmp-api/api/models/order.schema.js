import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth"
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth"
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        default: 1,
        required: true
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["done"],
        default: "done"
    }
}, {
    timestamps: true
})

export const Order = mongoose.model("Order", orderSchema)