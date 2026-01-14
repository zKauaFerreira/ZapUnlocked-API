const express = require("express");
const router = express.Router();
const getStatus = require("../controllers/status/getStatus");

/**
 * Rotas principais
 */

// GET / - Status da API
// GET / - Status da API
router.get("/", getStatus);

// GET /status - Endpoint específico para o frontend
router.get("/status", getStatus);

module.exports = router;
