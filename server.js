require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const movieRoutes = require("./routes/movie");

const app = express();
const PORT = process.env.PORT || "https://cinemalens.vercel.app";

const missing = [];
if (!process.env.OMDB_API_KEY)       missing.push("OMDB_API_KEY");
if (!process.env.OPENROUTER_API_KEY) missing.push("OPENROUTER_API_KEY");
if (missing.length) {
  console.warn(`⚠️  Missing env vars: ${missing.join(", ")}`);
  console.warn("   Copy backend/.env.example → backend/.env and fill in your keys.");
}

// ─── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

// Rate limiting – 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many requests. Please slow down." },
});
app.use("/api", limiter);

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/movie", movieRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🎬 CinemaLens backend running on http://localhost:${PORT}`);
});
