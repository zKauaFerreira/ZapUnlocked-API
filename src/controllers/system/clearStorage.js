const storage = require("../../services/whatsapp/storage");

/**
 * Rota para limpar manualmente todos os dados de chats (JSONs e GZIPs)
 * Útil para resetar o volume sem necessariamente deslogar (ou para corrigir estados)
 */
const clearStorage = async (req, res) => {
    try {
        await storage.clearAllData();

        return res.json({
            success: true,
            message: "Todos os arquivos de chat e índices foram apagados do disco."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Erro ao limpar storage",
            details: error.message
        });
    }
};

module.exports = clearStorage;
