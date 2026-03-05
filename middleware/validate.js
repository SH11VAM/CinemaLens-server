/**
 * Middleware to validate IMDb ID format.
 * Valid format: tt followed by 7 or 8 digits (e.g. tt0133093, tt12345678)
 */
function validateImdbId(req, res, next) {
  const { imdbId } = req.params;

  if (!imdbId) {
    return res.status(400).json({ success: false, error: "IMDb ID is required." });
  }

  const pattern = /^tt\d{7,8}$/i;
  if (!pattern.test(imdbId.trim())) {
    return res.status(400).json({
      success: false,
      error: "Invalid IMDb ID format. Expected format: tt followed by 7–8 digits (e.g. tt0133093).",
    });
  }

  next();
}

module.exports = { validateImdbId };
