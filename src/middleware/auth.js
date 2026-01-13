const { API_KEY } = require("../config/constants");

/**
 * Middleware de autenticação via API Key
 */
function auth(req, res, next) {
  const apiKeyHeader = req.headers["x-api-key"];
  const apiKeyQuery = req.query.API_KEY;

  if (apiKeyHeader !== API_KEY && apiKeyQuery !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

module.exports = { auth };
