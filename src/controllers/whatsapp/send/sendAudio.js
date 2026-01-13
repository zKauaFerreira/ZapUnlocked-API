const whatsappService = require("../../../services/whatsapp");
const mediaService = require("../../../services/mediaService");
const mediaQueue = require("../../../services/mediaQueue");
const logger = require("../../../utils/logger");

/**
 * Envia áudio via WhatsApp baixando de uma URL
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function sendAudio(req, res) {
    const { phone, audio_url, ptt, asDocument } = req.body;
    logger.log(`🔍 Request recebida em /send_audio para ${phone}`);

    if (!whatsappService.getStatus()) {
        return res.status(503).json({ error: "WhatsApp ainda não conectado" });
    }

    if (!phone || !audio_url) {
        return res.status(400).json({ error: "phone e audio_url são obrigatórios" });
    }

    let filePath = null;

    try {
        await mediaQueue.enqueue(async () => {
            const jid = `${phone}@s.whatsapp.net`;

            // 1. Baixa o áudio
            filePath = await mediaService.downloadMedia(audio_url);

            // 2. Determina modo
            const fileSize = mediaService.getFileSize(filePath);
            const isTooBigForPtt = fileSize > (15 * 1024 * 1024);

            if (asDocument || isTooBigForPtt) {
                logger.log(`🎵 Áudio será enviado como documento.`);
                await whatsappService.sendDocumentMessage(
                    jid,
                    filePath,
                    `audio_${Date.now()}.mp3`,
                    "audio/mpeg"
                );
            } else {
                // Envia como áudio (se ptt=true, aparece como mensagem de voz)
                await whatsappService.sendAudioMessage(jid, filePath, !!ptt);
            }

            // 3. Limpa
            mediaService.cleanup(filePath);
            filePath = null;
        });

        res.json({ success: true, message: "Áudio enviado com sucesso ✅" });
    } catch (err) {
        logger.error("❌ Erro ao enviar áudio:", err.message);
        res.status(500).json({ error: err.message });
        if (filePath) mediaService.cleanup(filePath);
    }
}

module.exports = sendAudio;
