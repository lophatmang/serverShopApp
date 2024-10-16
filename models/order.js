const mongoose = require("mongoose");

const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  product: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: { type: Number, required: true },
    },
  ],
  orderTime: { type: String, default: new Date().toLocaleString("vi-VN") },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["paying", "shipping", "completed", "canceled"],
    default: "paying",
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
