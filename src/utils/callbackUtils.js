const crypto = require("crypto");
const { INTERNAL_SECRET } = require("../config/constants");

/**
 * Cria um token assinado e codificado para embutir no botão
 * @param {Object} webhook - Configuração do webhook
 * @returns {string} Token Base64 URL-safe
 */
function createCallbackPayload(webhook) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (24 * 60 * 60); // 24 horas de validade

    // Payload compacto
    const payload = {
        w: {
            u: webhook.url,
            m: (webhook.method || "POST").toUpperCase(),
            h: webhook.headers || {},
            b: webhook.body || {}
        },
        exp
    };

    const json = JSON.stringify(payload);
    const signature = crypto
        .createHmac("sha256", INTERNAL_SECRET)
        .update(json)
        .digest("hex");

    const finalPayload = {
        p: payload,
        s: signature.substring(0, 16) // Assinatura curta para economizar caracteres no botão
    };

    return Buffer.from(JSON.stringify(finalPayload)).toString("base64url");
}

/**
 * Verifica a assinatura e decodifica o payload
 * @param {string} token - Token vindo do botão
 * @returns {Object|null} Configuração do webhook ou null se inválido
 */
function verifyAndDecodePayload(token) {
    try {
        const json = Buffer.from(token, "base64url").toString("utf8");
        const { p: payload, s: signature } = JSON.parse(json);

        // Valida expiração
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
            return null;
        }

        // Valida assinatura
        const payloadStr = JSON.stringify(payload);
        const expectedSig = crypto
            .createHmac("sha256", INTERNAL_SECRET)
            .update(payloadStr)
            .digest("hex")
            .substring(0, 16);

        if (signature !== expectedSig) {
            return null;
        }

        return {
            url: payload.w.u,
            method: payload.w.m,
            headers: payload.w.h,
            body: payload.w.b
        };
    } catch (err) {
        return null;
    }
}

module.exports = {
    createCallbackPayload,
    verifyAndDecodePayload
};
