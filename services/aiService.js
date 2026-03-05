const axios = require("axios");

// OpenRouter uses the OpenAI-compatible API format
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free & low-cost models available on OpenRouter:
// "mistralai/mistral-7b-instruct"        ← completely free
// "google/gemma-3-27b-it:free"           ← completely free
// "meta-llama/llama-3.1-8b-instruct:free" ← completely free
// "anthropic/claude-3-haiku"             ← paid but very cheap
const MODEL = process.env.OPENROUTER_MODEL || "google/gemma-3-27b-it:free";

/**
 * Analyzes audience sentiment for a given movie using OpenRouter AI.
 * OpenRouter provides access to 100+ models (many free) via one API key.
 * Get your free key at: https://openrouter.ai/keys
 *
 * @param {Object} movieData - Normalized movie object from omdbService
 * @returns {Promise<Object>} Sentiment result with percentages, summary, highlights
 */
async function analyzeSentiment(movieData) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const prompt = buildPrompt(movieData);

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
      // Optional: show your app in OpenRouter rankings
      // Uncomment and fill these if you want:
      // "X-Title": "CinemaLens",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
        "X-Title": "CinemaLens",
      },
      timeout: 30000,
    }
  );

  // OpenRouter returns OpenAI-compatible response format
  const rawText = response.data.choices?.[0]?.message?.content || "";
  if (!rawText) throw new Error("Empty response from OpenRouter.");

  return parseAIResponse(rawText);
}

function buildPrompt(movie) {
  return `You are a film analyst AI. Based on the following movie data, generate a detailed audience sentiment analysis.

Movie: "${movie.title}" (${movie.year})
Genre: ${movie.genre?.join(", ") || "Unknown"}
Director: ${movie.director || "Unknown"}
Actors: ${movie.actors?.join(", ") || "Unknown"}
Plot: ${movie.plot || "N/A"}
IMDb Rating: ${movie.imdbRating || "N/A"}/10 (${movie.imdbVotes || "N/A"} votes)
Metascore: ${movie.metascore || "N/A"}
Awards: ${movie.awards || "None"}
Box Office: ${movie.boxOffice || "Unknown"}

Respond ONLY in this exact JSON format. No markdown, no extra text, no explanation:
{
  "sentiment": "positive",
  "positive_pct": 75,
  "neutral_pct": 15,
  "negative_pct": 10,
  "summary": "2-3 sentence summary of how audiences received this film. Be specific to the film.",
  "highlights": [
    "Specific thing audiences praised",
    "Key criticism or concern",
    "Notable cultural or critical insight"
  ]
}

Rules:
- sentiment must be exactly "positive", "mixed", or "negative"
- positive_pct + neutral_pct + negative_pct must equal exactly 100
- Base sentiment on the combination of IMDb rating, metascore, awards, and typical audience reception patterns
- Be specific — avoid generic statements`;
}

function parseAIResponse(rawText) {
  const clean = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  // Validate required fields
  const required = ["sentiment", "positive_pct", "neutral_pct", "negative_pct", "summary", "highlights"];
  for (const field of required) {
    if (parsed[field] === undefined) throw new Error(`AI response missing field: ${field}`);
  }

  // Validate sentiment value
  if (!["positive", "mixed", "negative"].includes(parsed.sentiment)) {
    throw new Error("Invalid sentiment value from AI");
  }

  // Validate percentages sum to 100
  const total = parsed.positive_pct + parsed.neutral_pct + parsed.negative_pct;
  if (Math.abs(total - 100) > 1) {
    throw new Error(`Sentiment percentages sum to ${total}, expected 100`);
  }

  return parsed;
}

module.exports = { analyzeSentiment };
