require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`HotelPro API listening on ${port}`)))
  .catch((error) => {
    console.error("Database startup failed:", error.message);
    process.exit(1);
  });
