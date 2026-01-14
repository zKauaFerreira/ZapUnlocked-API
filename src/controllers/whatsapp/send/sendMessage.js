const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");

/**
 * Envia mensagem de texto via WhatsApp
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendMessage(req, res) {
    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    const { phone, message, reply, type, quoted_id } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: "phone e message obrigatórios" });
    }

    try {
        const jid = `${phone}@s.whatsapp.net`;
        const options = {};

        // Identificador de resposta (pode ser o ID ou Texto conforme o type)
        const replyIdentifier = reply || quoted_id;
        const replyType = type || "id";

        if (replyIdentifier) {
            const quotedMsg = await whatsappService.findMessage(jid, replyIdentifier, replyType);

            if (quotedMsg) {
                options.quoted = quotedMsg;
            } else if (replyType === "id") {
                // Se for ID e não encontrar, tenta criar stub para garantir o reply visual
                options.quoted = {
                    key: {
                        remoteJid: jid,
                        fromMe: false,
                        id: replyIdentifier
                    },
                    message: { conversation: "..." }
                };
            } else {
                throw new Error(`Não foi possível encontrar a mensagem para responder com o texto: "${replyIdentifier}"`);
            }
        }

        await whatsappService.sendMessage(jid, message, options);

        res.json({ success: true, message: "Mensagem enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendMessage;
