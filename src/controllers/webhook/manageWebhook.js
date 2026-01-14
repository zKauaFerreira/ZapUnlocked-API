const webhookConfig = require("../../services/webhookConfig");
const logger = require("../../utils/logger");

/**
 * Configura ou atualiza o webhook global
 */
exports.configureWebhook = (req, res) => {
    try {
        const { url, method, headers, body } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL é obrigatória" });
        }

        const config = webhookConfig.saveWebhookConfig({ url, method, headers, body });

        logger.log("🔗 Webhook global configurado com sucesso.");
        res.json({ success: true, message: "Webhook configurado", config });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Ativa ou Desativa o webhook (on/off)
 */
exports.toggleWebhook = (req, res) => {
    try {
        const { status } = req.body; // "on" ou "off"

        if (status !== "on" && status !== "off") {
            return res.status(400).json({ error: "Status deve ser 'on' ou 'off'" });
        }

        const enabled = status === "on";
        const config = webhookConfig.toggleWebhook(enabled);

        logger.log(`🔗 Webhook global ${enabled ? 'ATIVADO' : 'DESATIVADO'}.`);
        res.json({ success: true, message: `Webhook ${status}`, config });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Remove o webhook
 */
exports.deleteWebhook = (req, res) => {
    try {
        webhookConfig.deleteWebhookConfig();
        logger.log("🔗 Webhook global removido.");
        res.json({ success: true, message: "Webhook removido e arquivo apagado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
