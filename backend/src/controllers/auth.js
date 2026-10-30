const User = require("../models/User");
const jwt = require("jsonwebtoken");
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
function tokenFor(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
}
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, bootstrapSecret } = req.body;
    if (!name || !email || !password || String(password).length < 8)
      return res.status(400).json({ message: "Name, email and a password of at least 8 characters are required." });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    let role = "guest";
    if (process.env.ALLOW_ADMIN_BOOTSTRAP === "true" &&
        process.env.ADMIN_BOOTSTRAP_SECRET &&
        bootstrapSecret === process.env.ADMIN_BOOTSTRAP_SECRET &&
        !(await User.exists({ role: "admin" }))) role = "admin";
    const user = await User.create({ name, email: normalizedEmail, password, role });
    res.status(201).json({ user: publicUser(user), token: tokenFor(user) });
  } catch (e) { next(e); }
};
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || "").trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(req.body.password || ""))) return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ user: publicUser(user), token: tokenFor(user) });
  } catch (e) { next(e); }
};
exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ user: publicUser(user) });
};
