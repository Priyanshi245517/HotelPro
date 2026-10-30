const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  roomNumber: { type: String, required: true, trim: true, unique: true },
  type: { type: String, required: true, enum: ["Standard", "Deluxe", "Suite", "Family"] },
  pricePerNight: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  amenities: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model("Room", schema);
