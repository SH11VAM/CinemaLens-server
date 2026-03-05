const express = require("express");
const router = express.Router();
const { validateImdbId } = require("../middleware/validate");
const omdbService = require("../services/omdbService");
const aiService = require("../services/aiService");

/**
 * GET /api/movie/:imdbId
 * Returns movie metadata from OMDb
 */
router.get("/:imdbId", validateImdbId, async (req, res) => {
  const { imdbId } = req.params;
  try {
    const movie = await omdbService.fetchMovie(imdbId);
    res.json({ success: true, data: movie });
  } catch (err) {
    const status = err.message === "Movie not found." ? 404 : 502;
    res.status(status).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/movie/sentiment
 * Accepts movie data, returns AI sentiment analysis
 */
router.post("/sentiment", async (req, res) => {
  const { movieData } = req.body;
  if (!movieData || !movieData.title) {
    return res.status(400).json({ success: false, error: "movieData is required." });
  }
  try {
    const sentiment = await aiService.analyzeSentiment(movieData);
    res.json({ success: true, data: sentiment });
  } catch (err) {
    console.error("[Sentiment Error]", err.message);
    res.status(500).json({ success: false, error: "AI sentiment analysis failed." });
  }
});

module.exports = router;
