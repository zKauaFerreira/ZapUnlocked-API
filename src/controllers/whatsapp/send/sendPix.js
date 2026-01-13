const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");

/**
 * Envia uma mensagem PIX interativa via WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendPix(req, res) {
    const { phone, text, pix_key, key_type, merchant_name } = req.body;
    logger.log(`🔍 Request recebida em /send_pix para ${phone}`);

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    if (!phone || !pix_key) {
        return res.status(400).json({ error: "phone e pix_key são obrigatórios" });
    }

    try {
        const jid = `${phone}@s.whatsapp.net`;
        await whatsappService.sendPixMessage(
            jid,
            text || "",
            pix_key,
            key_type || "EVP",
            merchant_name || "Pagamento via API"
        );

        res.json({ success: true, message: "Mensagem PIX enviada com sucesso ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar PIX:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendPix;
