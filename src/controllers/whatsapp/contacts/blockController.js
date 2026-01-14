const { getSock } = require("../../services/whatsapp/client");
const logger = require("../../utils/logger");

exports.blockUser = async (req, res) => {
    try {
        const sock = getSock();
        if (!sock) return res.status(503).json({ error: "WhatsApp não conectado" });

        const { phone, action } = req.body;

        if (!phone) {
            return res.status(400).json({ error: "Número de telefone (phone) é obrigatório" });
        }

        if (!action || (action !== "block" && action !== "unblock")) {
            return res.status(400).json({ error: "Ação (action) deve ser 'block' ou 'unblock'" });
        }

        const jid = `${phone}@s.whatsapp.net`;

        await sock.updateBlockStatus(jid, action);

        logger.log(`🚫 Usuário ${phone} ${action === "block" ? "BLOQUEADO" : "DESBLOQUEADO"}`);

        res.json({
            success: true,
            message: `Usuário ${phone} ${action === "block" ? "bloqueado" : "desbloqueado"} com sucesso.`
        });

    } catch (err) {
        logger.error(`Erro ao ${req.body.action} usuário ${req.body.phone}`, err.message);
        res.status(500).json({ error: err.message });
    }
};
