const whatsappService = require("../../../services/whatsapp");
const mediaService = require("../../../services/mediaService");
const mediaQueue = require("../../../services/mediaQueue");
const logger = require("../../../utils/logger");
const path = require("path");

/**
 * Envia documento via WhatsApp baixando de uma URL
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendDocument(req, res) {
    const { phone, document_url, fileName } = req.body;
    logger.log(`🔍 Request recebida em /send_document para ${phone}`);

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    if (!phone || !document_url) {
        return res.status(400).json({ error: "phone e document_url são obrigatórios" });
    }

    let filePath = null;

    try {
        await mediaQueue.enqueue(async () => {
            const jid = `${phone}@s.whatsapp.net`;

            // 1. Baixa o arquivo
            filePath = await mediaService.downloadMedia(document_url);

            // 2. Resolve nome e mimetype
            const finalFileName = fileName || path.basename(filePath);

            // 3. Envia pro WhatsApp
            await whatsappService.sendDocumentMessage(
                jid,
                filePath,
                finalFileName,
                "application/octet-stream"
            );

            // 4. Limpa
            mediaService.cleanup(filePath);
            filePath = null;
        });

        res.json({ success: true, message: "Documento enviado com sucesso ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar documento:", err.message);
        res.status(500).json({ error: err.message });
        if (filePath) mediaService.cleanup(filePath);
    }
}

module.exports = sendDocument;
