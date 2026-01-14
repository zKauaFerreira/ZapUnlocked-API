const express = require("express");
const router = express.Router();
const manageWebhook = require("../controllers/webhook/manageWebhook");
const { auth } = require("../middleware/auth");

// Todas as rotas de webhook requerem API KEY
router.use(auth);

router.post("/config", manageWebhook.configureWebhook);
router.post("/toggle", manageWebhook.toggleWebhook);
router.delete("/", manageWebhook.deleteWebhook);

module.exports = router;
