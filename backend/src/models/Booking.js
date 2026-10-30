const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  numberOfGuests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" }
}, { timestamps: true });
schema.index({ room: 1, checkIn: 1, checkOut: 1, status: 1 });
schema.index({ guest: 1, createdAt: -1 });
module.exports = mongoose.model("Booking", schema);
