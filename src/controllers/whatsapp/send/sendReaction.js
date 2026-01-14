const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");

/**
 * Reage a uma mensagem específica via WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendReaction(req, res) {
    const { phone, reaction, type, emoji, messageId, text } = req.body;

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    // Suporta o novo formato (reaction/type) e o antigo (messageId/text) por compatibilidade
    const identifier = reaction || messageId || text;
    const identificationType = type || (text && !messageId ? "text" : "id");

    // Permite emoji vazio para REMOVER a reação
    if (!phone || !identifier || emoji === undefined) {
        return res.status(400).json({ error: "phone, (reaction ou messageId) e emoji são obrigatórios (envie emoji vazio para remover)" });
    }

    try {
        const jid = `${phone}@s.whatsapp.net`;

        await whatsappService.sendReaction(jid, identifier, emoji, identificationType);

        res.json({ success: true, message: "Reação enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar reação:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendReaction;
