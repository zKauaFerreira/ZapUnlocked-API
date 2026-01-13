const { createCallbackPayload } = require("../../../utils/callbackUtils");

/**
 * Envia mensagem com botão customizado via WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendWithButtons(req, res) {
    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    const { phone, message, button_text, webhook } = req.body;

    if (!phone || !message || !button_text) {
        return res.status(400).json({ error: "phone, message e button_text obrigatórios" });
    }

    try {
        let finalButtonText = button_text;

        // Se houver configuração de webhook, gera o callback e concatena no texto do botão
        if (webhook && webhook.url) {
            const token = createCallbackPayload(webhook);
            finalButtonText = `${button_text}|cb=${token}`;
        }

        const jid = `${phone}@s.whatsapp.net`;
        await whatsappService.sendButtonMessage(jid, message, finalButtonText, finalButtonText);

        res.json({ success: true, message: "Mensagem com botão enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar com botão:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendWithButtons;
