const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const sendMessage = require("../controllers/whatsapp/send/sendMessage");
const sendButton = require("../controllers/whatsapp/send/sendButton");
const sendImage = require("../controllers/whatsapp/send/sendImage");
const sendAudio = require("../controllers/whatsapp/send/sendAudio");
const sendVideo = require("../controllers/whatsapp/send/sendVideo");
const sendDocument = require("../controllers/whatsapp/send/sendDocument");
const sendSticker = require("../controllers/whatsapp/send/sendSticker");

/**
 * Rotas para envio de mensagens
 */

// POST /send - Enviar mensagem via WhatsApp
router.post("/send", auth, sendMessage);

// POST /send_wbuttons - Enviar mensagem com botões via WhatsApp
router.post("/send_wbuttons", auth, sendButton);

// POST /send_image - Enviar imagem via WhatsApp (URL)
router.post("/send_image", auth, sendImage);

// POST /send_audio - Enviar áudio via WhatsApp (URL)
router.post("/send_audio", auth, sendAudio);

// POST /send_video - Enviar vídeo via WhatsApp (URL)
router.post("/send_video", auth, sendVideo);

// POST /send_document - Enviar documento via WhatsApp (URL)
router.post("/send_document", auth, sendDocument);

// POST /send_sticker - Enviar figurinha via WhatsApp (URL)
router.post("/send_sticker", auth, sendSticker);

module.exports = router;
