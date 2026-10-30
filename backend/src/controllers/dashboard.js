const Room = require("../models/Room");
const Booking = require("../models/Booking");
exports.summary = async (req, res, next) => {
  try {
    const [activeRooms, currentBookings, reservations, value] = await Promise.all([
      Room.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: "confirmed", checkIn: { $lte: new Date() }, checkOut: { $gt: new Date() } }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.aggregate([{ $match: { status: "confirmed" } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }])
    ]);
    res.json({ metrics: { activeRooms, currentBookings, reservations, totalValue: value[0]?.total || 0 } });
  } catch (e) { next(e); }
};
