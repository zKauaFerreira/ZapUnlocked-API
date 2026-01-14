const fs = require("fs");
const path = require("path");
const { DATA_DIR } = require("../../config/constants");

// Caminho para o arquivo de configuração do webhook (data/chats/webhook.json)
const WEBHOOK_FILE = path.join(DATA_DIR, "chats", "webhook.json");
const CHATS_DIR = path.join(DATA_DIR, "chats");

// Garante que o diretório chats existe
if (!fs.existsSync(CHATS_DIR)) {
    try { fs.mkdirSync(CHATS_DIR, { recursive: true }); } catch (e) { }
}

/**
 * Salva a configuração do webhook
 * @param {Object} config - { url, method, headers, body, enabled }
 */
function saveWebhookConfig(config) {
    // Mantém o estado enabled anterior se não for passado
    const current = getWebhookConfig();

    const finalConfig = {
        enabled: config.enabled !== undefined ? config.enabled : (current?.enabled || true), // Padrão ON ao criar
        url: config.url,
        method: config.method || "POST",
        headers: config.headers || {},
        body: config.body || {},
    };

    fs.writeFileSync(WEBHOOK_FILE, JSON.stringify(finalConfig, null, 2));
    return finalConfig;
}

/**
 * Lê a configuração do webhook
 * @returns {Object|null}
 */
function getWebhookConfig() {
    try {
        if (!fs.existsSync(WEBHOOK_FILE)) return null;
        const raw = fs.readFileSync(WEBHOOK_FILE, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        return null;
    }
}

/**
 * Alterna o estado (on/off)
 * @param {boolean} status - true para ON, false para OFF
 */
function toggleWebhook(status) {
    const config = getWebhookConfig();
    if (!config) throw new Error("Webhook ainda não configurado. Use a rota de configuração primeiro.");

    config.enabled = status;
    fs.writeFileSync(WEBHOOK_FILE, JSON.stringify(config, null, 2));
    return config;
}

/**
 * Remove o arquivo de configuração e desativa
 */
function deleteWebhookConfig() {
    if (fs.existsSync(WEBHOOK_FILE)) {
        fs.unlinkSync(WEBHOOK_FILE);
    }
}

module.exports = {
    saveWebhookConfig,
    getWebhookConfig,
    toggleWebhook,
    deleteWebhookConfig
};
