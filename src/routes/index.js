const express = require("express");
const router = express.Router();
const getStatus = require("../controllers/status/getStatus");

const { auth } = require("../middleware/auth");

/**
 * Rotas principais
 */

// GET / - Status da API
// router.get("/", getStatus);

// GET /status - Endpoint específico para o frontend (Protegido)
router.get("/status", auth, getStatus);

module.exports = router;
