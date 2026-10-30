const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["guest", "staff", "admin"], default: "guest" }
}, { timestamps: true });
schema.pre("save", async function () {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
});
schema.methods.comparePassword = function (value) { return bcrypt.compare(value, this.password); };
module.exports = mongoose.model("User", schema);
