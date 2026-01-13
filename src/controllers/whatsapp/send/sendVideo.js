const whatsappService = require("../../../services/whatsapp");
const mediaService = require("../../../services/mediaService");
const mediaQueue = require("../../../services/mediaQueue");
const logger = require("../../../utils/logger");

/**
 * Envia vídeo via WhatsApp baixando de uma URL
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendVideo(req, res) {
    const { phone, video_url, caption, gifPlayback, ptv, asDocument } = req.body;
    logger.log(`🔍 Request recebida em /send_video para ${phone}`);

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    if (!phone || !video_url) {
        return res.status(400).json({ error: "phone e video_url são obrigatórios" });
    }

    let filePath = null;

    try {
        await mediaQueue.enqueue(async () => {
            const jid = `${phone}@s.whatsapp.net`;

            // 1. Baixa o vídeo
            filePath = await mediaService.downloadMedia(video_url);

            // 2. Determina se deve mandar como documento (acima de 15MB)
            const fileSize = mediaService.getFileSize(filePath);
            const shouldBeDoc = asDocument || fileSize > (15 * 1024 * 1024);

            if (shouldBeDoc) {
                logger.log(`🎥 Vídeo grande detected (${(fileSize / 1024 / 1024).toFixed(2)}MB). Enviando como documento.`);
            }

            // 3. Envia pro WhatsApp
            await whatsappService.sendVideoMessage(
                jid,
                filePath,
                caption || "",
                shouldBeDoc,
                !!gifPlayback,
                !!ptv
            );

            // 4. Limpa
            mediaService.cleanup(filePath);
            filePath = null;
        });

        res.json({ success: true, message: "Vídeo enviado com sucesso ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar vídeo:", err.message);
        res.status(500).json({ error: err.message });
        if (filePath) mediaService.cleanup(filePath);
    }
}

module.exports = sendVideo;
