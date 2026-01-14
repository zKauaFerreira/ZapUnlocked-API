const express = require("express");
const router = express.Router();
const fetchMessages = require("../controllers/whatsapp/management/fetchMessages");
const getRecentChats = require("../controllers/whatsapp/management/getRecentChats");
const getVolumeStats = require("../controllers/system/getVolumeStats");
const clearStorage = require("../controllers/system/clearStorage");
const { auth } = require("../middleware/auth");

// Todas as rotas de gerenciamento requerem API KEY
router.use(auth);

router.post("/fetch_messages", fetchMessages);
router.post("/recent_contacts", getRecentChats);
router.get("/volume_stats", getVolumeStats);
router.delete("/cleanup", clearStorage);

module.exports = router;
