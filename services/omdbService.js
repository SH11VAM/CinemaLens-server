const axios = require("axios");

const BASE_URL = "http://www.omdbapi.com/";

/**
 * Fetches full movie data from OMDb API by IMDb ID.
 * @param {string} imdbId - e.g. "tt0133093"
 * @returns {Promise<Object>} Parsed movie object
 */
async function fetchMovie(imdbId) {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) throw new Error("OMDB_API_KEY is not configured.");

  const response = await axios.get(BASE_URL, {
    params: {
      i: imdbId.toLowerCase(),
      plot: "full",
      apikey: apiKey,
    },
    timeout: 8000,
  });

  const data = response.data;

  if (data.Response === "False") {
    throw new Error(data.Error || "Movie not found.");
  }

  // Normalize / clean up fields
  return {
    imdbID: data.imdbID,
    title: data.Title,
    year: data.Year,
    rated: data.Rated !== "N/A" ? data.Rated : null,
    released: data.Released !== "N/A" ? data.Released : null,
    runtime: data.Runtime !== "N/A" ? data.Runtime : null,
    genre: data.Genre !== "N/A" ? data.Genre.split(", ") : [],
    director: data.Director !== "N/A" ? data.Director : null,
    writers: data.Writer !== "N/A" ? data.Writer.split(", ") : [],
    actors: data.Actors !== "N/A" ? data.Actors.split(", ") : [],
    plot: data.Plot !== "N/A" ? data.Plot : null,
    language: data.Language !== "N/A" ? data.Language : null,
    country: data.Country !== "N/A" ? data.Country : null,
    awards: data.Awards !== "N/A" ? data.Awards : null,
    poster: data.Poster !== "N/A" ? data.Poster : null,
    ratings: data.Ratings || [],
    imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : null,
    imdbVotes: data.imdbVotes !== "N/A" ? data.imdbVotes : null,
    metascore: data.Metascore !== "N/A" ? data.Metascore : null,
    boxOffice: data.BoxOffice !== "N/A" ? data.BoxOffice : null,
    production: data.Production !== "N/A" ? data.Production : null,
  };
}

module.exports = { fetchMovie };
