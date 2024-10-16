const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  chatMessage: [
    {
      message: { type: String, required: true },
      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: true,
      },
    },
  ],
  lastActiveTime: { type: String, default: new Date().toLocaleString() },
});

module.exports = mongoose.model("Session", sessionSchema);
