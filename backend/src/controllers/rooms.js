const Room = require("../models/Room");
exports.list = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ roomNumber: 1 });
    res.json({ rooms });
  } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ room });
  } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: "Room not found." });
    res.json({ room });
  } catch (e) { next(e); }
};
exports.deactivate = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found." });
    res.json({ room });
  } catch (e) { next(e); }
};
