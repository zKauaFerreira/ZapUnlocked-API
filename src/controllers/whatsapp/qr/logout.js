const client = require("../../../services/whatsapp/client");
const logger = require("../../../utils/logger");

const logout = async (req, res) => {
    try {
        // Verifica se o usuário quer manter os dados (queryParams)
        // Ex: /whatsapp/qr/logout?keepData=true
        const keepData = req.query.keepData === 'true';

        await client.logout(keepData);

        const message = keepData
            ? "Desconectado com sucesso (Dados preservados). A página será recarregada."
            : "Desconectado com sucesso (Dados apagados). A página será recarregada.";

        return res.json({
            success: true,
            message: message
        });
    } catch (error) {
        logger.error("Erro no logout:", error);
        return res.status(500).json({
            success: false,
            error: "Erro ao realizar logout"
        });
    }
};

module.exports = logout;
