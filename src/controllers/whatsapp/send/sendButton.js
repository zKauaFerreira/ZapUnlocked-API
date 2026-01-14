const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");
const { formatText } = require("../../../utils/formatter");
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

    const { phone, message, button_text, webhook, reaction, reply, type, quoted_id } = req.body;

    if (!phone || !message || !button_text) {
        return res.status(400).json({ error: "phone, message e button_text obrigatórios" });
    }

    try {
        let buttonId = "reply_button"; // ID padrão

        // Se houver configuração de webhook ou reação, gera o callback e usa como ID
        if ((webhook && (webhook.url || webhook.reaction)) || reaction) {
            const token = createCallbackPayload({
                ...(webhook || {}),
                reaction: reaction || (webhook && webhook.reaction) || null
            });
            buttonId = `cb=${token}`;
        }

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

        const formattedMessage = formatText(message, { phone });
        const formattedButtonText = formatText(button_text, { phone });

        await whatsappService.sendButtonMessage(jid, formattedMessage, formattedButtonText, buttonId, options);

        res.json({ success: true, message: "Mensagem com botão enviada ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar com botão:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = sendWithButtons;
