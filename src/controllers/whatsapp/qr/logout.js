const whatsappService = require("../../../services/whatsapp");
const logger = require("../../../utils/logger");

/**
 * Faz logout (apaga sessão e reinicia bot)
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function logout(req, res) {
    try {
        await whatsappService.logout();
        res.json({
            success: true,
            message: "Logout realizado com sucesso. O bot foi reiniciado e aguarda novo escaneamento."
        });
    } catch (error) {
        logger.error("❌ Erro ao apagar sessão:", error.message);
        res.status(500).json({
            error: "Erro ao apagar sessão",
            message: error.message
        });
    }
}

module.exports = logout;
