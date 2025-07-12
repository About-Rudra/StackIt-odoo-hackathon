const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => res.send("StackIt Backend Running 🚀"));
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
