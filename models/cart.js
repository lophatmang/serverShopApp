const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
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
  totalPrice: { type: Number, default: 0 },
});

module.exports = mongoose.model("Cart", cartSchema);
