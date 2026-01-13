const whatsappService = require("../../../services/whatsapp");
const imageService = require("../../../services/imageService");
const logger = require("../../../utils/logger");

/**
 * Envia imagem via WhatsApp baixando de uma URL
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendImage(req, res) {
    logger.log(`🔍 Request recebida em /send_image: ${JSON.stringify(req.body)}`);

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    const { phone, image_url, caption } = req.body;

    if (!phone || !image_url) {
        return res.status(400).json({ error: "phone e image_url são obrigatórios" });
    }

    let filePath = null;

    try {
        const jid = `${phone}@s.whatsapp.net`;

        // 1. Baixa a imagem
        logger.log(`📥 Baixando imagem para ${phone}...`);
        filePath = await imageService.downloadImage(image_url);

        // 2. Envia pro WhatsApp
        logger.log(`📤 Enviando imagem para ${phone}...`);
        await whatsappService.sendImageMessage(jid, filePath, caption || "");

        res.json({ success: true, message: "Imagem enviada com sucesso ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar imagem:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        // 3. Limpa o arquivo sempre
        if (filePath) {
            imageService.cleanup(filePath);
        }
    }
}

module.exports = sendImage;
