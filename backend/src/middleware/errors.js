function notFound(req, res) { res.status(404).json({ message: "Route not found." }); }
function errors(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.statusCode || (err.code === 11000 ? 409 : 500);
  const message = err.code === 11000 ? "That value already exists." : err.message || "Server error.";
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
}
module.exports = { notFound, errors };
