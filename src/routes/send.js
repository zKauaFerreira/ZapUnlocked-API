const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const sendMessage = require("../controllers/whatsapp/send/sendMessage");
const sendButton = require("../controllers/whatsapp/send/sendButton");
const sendImage = require("../controllers/whatsapp/send/sendImage");

/**
 * Rotas para envio de mensagens
 */

// POST /send - Enviar mensagem via WhatsApp
router.post("/send", auth, sendMessage);

// POST /send_wbuttons - Enviar mensagem com botões via WhatsApp
router.post("/send_wbuttons", auth, sendButton);

// POST /send_image - Enviar imagem via WhatsApp (URL)
router.post("/send_image", auth, sendImage);

module.exports = router;
