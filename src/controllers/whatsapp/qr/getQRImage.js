const whatsappService = require("../../../services/whatsapp");


/**
 * Retorna o QR Code como imagem PNG
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function getQRImage(req, res) {
    const qr = whatsappService.getQRCode();

    if (!qr) {
        return res.status(404).json({
            error: "QR Code não disponível",
            message: whatsappService.getStatus()
                ? "WhatsApp já está conectado"
                : "Aguardando geração do QR Code..."
        });
    }

    try {
        const QRCode = require("qrcode");
        const qrBuffer = await QRCode.toBuffer(qr, {
            type: "png",
            width: 300,
            margin: 2
        });

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.send(qrBuffer);
    } catch (error) {
        res.status(500).json({ error: "Erro ao gerar QR Code", message: error.message });
    }
}

module.exports = getQRImage;
