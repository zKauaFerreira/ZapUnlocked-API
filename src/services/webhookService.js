const axios = require("axios");
const logger = require("../utils/logger");

/**
 * Dispara o webhook com substituição de variáveis
 * @param {Object} config - Configuração do webhook (url, method, headers, body)
 * @param {Object} context - Dados do contexto (from, text)
 */
async function triggerWebhook(config, context) {
    const { url, method, headers, body } = config;
    const timestamp = new Date().toISOString();

    // Função recursiva para substituir placeholders em objetos e strings
    const replacePlaceholders = (data) => {
        if (typeof data === "string") {
            return data
                .replace(/{{from}}/g, context.from || "")
                .replace(/{{text}}/g, context.text || "")
                .replace(/{{phone}}/g, context.phone || context.from || "")
                .replace(/{{requested}}/g, context.requested || "0")
                .replace(/{{found}}/g, context.found || "0")
                .replace(/{{id}}/g, context.id || "")
                .replace(/{{timestamp}}/g, timestamp);
        }

        if (Array.isArray(data)) {
            return data.map(item => replacePlaceholders(item));
        }

        if (typeof data === "object" && data !== null) {
            const result = {};
            for (const key in data) {
                result[key] = replacePlaceholders(data[key]);
            }
            return result;
        }

        return data;
    };

    const finalHeaders = replacePlaceholders(headers);
    const finalBody = replacePlaceholders(body);

    try {
        logger.log(`🔗 Disparando Webhook: ${method} ${url}`);

        await axios({
            url,
            method,
            headers: finalHeaders,
            data: finalBody,
            timeout: 10000 // 10 segundos timeout
        });

        logger.log(`✅ Webhook enviado com sucesso para ${url}`);
    } catch (error) {
        logger.error(`❌ Erro ao disparar webhook para ${url}: ${error.message}`);
        if (error.response) {
            logger.error(`Status: ${error.response.status} - Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

module.exports = { triggerWebhook };
