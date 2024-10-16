const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "admin", "consultant"],
    default: "customer",
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
