const whatsappService = require("../../../services/whatsapp");
const mediaService = require("../../../services/mediaService");
const mediaQueue = require("../../../services/mediaQueue");
const logger = require("../../../utils/logger");

/**
 * Envia uma imagem como sticker/figurinha via WhatsApp baixando de uma URL
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendSticker(req, res) {
    const { phone, image_url } = req.body;
    logger.log(`🔍 Request recebida em /send_sticker para ${phone}`);

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    if (!phone || !image_url) {
        return res.status(400).json({ error: "phone e image_url são obrigatórios" });
    }

    let filePath = null;
    let stickerPath = null;

    try {
        await mediaQueue.enqueue(async () => {
            const jid = `${phone}@s.whatsapp.net`;

            // 1. Baixa a imagem
            logger.log(`📥 Baixando imagem para sticker (${phone})...`);
            filePath = await mediaService.downloadMedia(image_url);

            // 2. Converte para WebP (Sticker)
            logger.log(`🔄 Convertendo para sticker (${phone})...`);
            stickerPath = await mediaService.convertToWebP(filePath);

            // 3. Envia pro WhatsApp
            logger.log(`📤 Enviando sticker para ${phone}...`);
            await whatsappService.sendStickerMessage(jid, stickerPath);

            // 4. Limpa os arquivos
            if (filePath) mediaService.cleanup(filePath);
            if (stickerPath) mediaService.cleanup(stickerPath);
            filePath = null;
            stickerPath = null;
        });

        res.json({ success: true, message: "Figurinha enviada com sucesso ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar figurinha:", err.message);
        res.status(500).json({ error: err.message });
        if (filePath) mediaService.cleanup(filePath);
        if (stickerPath) mediaService.cleanup(stickerPath);
    }
}

module.exports = sendSticker;
