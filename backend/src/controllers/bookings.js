const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

exports.create = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, numberOfGuests } = req.body;
    if (!mongoose.isValidObjectId(roomId) || !checkIn || !checkOut ||
        !Number.isInteger(Number(numberOfGuests)) || Number(numberOfGuests) < 1)
      return res.status(400).json({ message: "Choose a room, valid dates and guest count." });
    const start = new Date(`${checkIn}T00:00:00.000Z`);
    const end = new Date(`${checkOut}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end)
      return res.status(400).json({ message: "Check-out must be after check-in." });
    const today = new Date(); today.setUTCHours(0,0,0,0);
    if (start < today) return res.status(400).json({ message: "Check-in cannot be in the past." });
    const room = await Room.findOne({ _id: roomId, isActive: true });
    if (!room) return res.status(404).json({ message: "Room is unavailable." });
    if (Number(numberOfGuests) > room.capacity) return res.status(400).json({ message: `This room accommodates up to ${room.capacity} guests.` });
    const conflict = await Booking.findOne({
      room: room._id, status: { $in: ["confirmed"] },
      checkIn: { $lt: end }, checkOut: { $gt: start }
    });
    if (conflict) return res.status(409).json({ message: "This room is already booked for those dates." });
    const nights = (end - start) / 86400000;
    const booking = await Booking.create({
      guest: req.user.id, room: room._id, checkIn: start, checkOut: end,
      numberOfGuests: Number(numberOfGuests), totalPrice: nights * room.pricePerNight,
      status: "confirmed"
    });
    res.status(201).json({ booking });
  } catch (e) { next(e); }
};
exports.list = async (req, res, next) => {
  try {
    const filter = ["staff", "admin"].includes(req.user.role) ? {} : { guest: req.user.id };
    const bookings = await Booking.find(filter).populate("guest", "name email").populate("room", "roomNumber type pricePerNight").sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (e) { next(e); }
};
exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    const manager = ["staff", "admin"].includes(req.user.role);
    if (!manager && booking.guest.toString() !== req.user.id) return res.status(403).json({ message: "You cannot cancel this booking." });
    if (booking.status !== "confirmed") return res.status(400).json({ message: "This booking cannot be cancelled." });
    booking.status = "cancelled";
    await booking.save();
    res.json({ booking });
  } catch (e) { next(e); }
};
