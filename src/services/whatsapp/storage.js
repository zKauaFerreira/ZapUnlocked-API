const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { promisify } = require("util");
const logger = require("../../utils/logger");

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Diretórios de dados
const DATA_DIR = path.join(process.cwd(), "data");
const CHATS_DIR = path.join(DATA_DIR, "chats");
const INDEX_FILE = path.join(CHATS_DIR, "index.json");

// Garante que os diretórios existam
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(CHATS_DIR)) fs.mkdirSync(CHATS_DIR);

// Limite de mensagens armazenadas por chat
const HISTORY_LIMIT = 100;

/**
 * Salva ou atualiza o índice leve de chats
 * @param {Object} chatInfo - { id, phone, name, unreadCount, lastMessageTimestamp, profilePicUrl }
 */
async function saveChatIndex(chatInfo) {
    try {
        let index = {};
        if (fs.existsSync(INDEX_FILE)) {
            const raw = fs.readFileSync(INDEX_FILE, "utf-8");
            index = JSON.parse(raw);
        }

        // Se o JID for LID, tentamos achar o real no índice ou ignoramos se não tiver phone válido
        let realPhone = chatInfo.phone;
        if (!realPhone && chatInfo.id) {
            realPhone = chatInfo.id.split("@")[0];
        }

        // Se já existe, atualiza metadados. Se é novo, cria.
        if (chatInfo.id) {
            index[chatInfo.id] = { ...index[chatInfo.id], ...chatInfo };

            // Salva de volta o índice (sem compressão para acesso rápido)
            fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
        }
    } catch (err) {
        logger.error("❌ Erro ao salvar índice de chats:", err.message);
    }
}

/**
 * Obtém a lista de chats recentes do índice
 * @returns {Array} Lista de chats ordenados por data
 */
function getRecentChatsFromIndex() {
    try {
        if (!fs.existsSync(INDEX_FILE)) return [];
        const raw = fs.readFileSync(INDEX_FILE, "utf-8");
        const index = JSON.parse(raw);
        return Object.values(index).sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
    } catch (err) {
        logger.error("❌ Erro ao ler índice de chats:", err.message);
        return [];
    }
}

/**
 * Adiciona uma mensagem ao histórico comprimido (GZIP)
 * @param {string} phone - Número do telefone (sem @s.whatsapp.net)
 * @param {Object} message - Objeto da mensagem
 */
async function addMessageToHistory(phone, message) {
    if (!phone) return;

    const fileName = `${phone}.json.gz`;
    const filePath = path.join(CHATS_DIR, fileName);
    let history = [];

    try {
        // Se arquivo existe, lê e descomprime
        if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            const decompressed = await gunzip(buffer);
            history = JSON.parse(decompressed.toString());
        }

        // Evita duplicatas baseada no ID
        if (!history.find(m => m.key?.id === message.key?.id)) {
            history.push(message);
        }

        // Mantém apenas as últimas 100 mensagens
        if (history.length > HISTORY_LIMIT) {
            history = history.slice(-HISTORY_LIMIT);
        }

        // Comprime e salva
        const stringified = JSON.stringify(history);
        const compressed = await gzip(stringified);
        fs.writeFileSync(filePath, compressed);

    } catch (err) {
        logger.error(`❌ Erro ao salvar histórico para ${phone}:`, err.message);
    }
}

/**
 * Adiciona múltiplas mensagens ao histórico de uma vez (Otimizado para History Sync)
 * @param {Array} messages - Array de mensagens do Baileys
 */
async function bulkAddMessages(messages) {
    if (!messages || messages.length === 0) return;

    // Agrupa mensagens por telefone
    const batch = {}; // { "555199...": [msg1, msg2] }

    for (const m of messages) {
        let jid = m.key.remoteJid;
        if (!jid || jid === "status@broadcast") continue;

        // Resolução básica de LID
        if (jid.includes("@lid")) {
            const phoneFromLid = resolvePhoneFromJid(jid);
            if (phoneFromLid) {
                // jid = `${phoneFromLid}@s.whatsapp.net`;
            }
        }

        const phone = jid.split("@")[0];
        if (!batch[phone]) batch[phone] = [];
        batch[phone].push(m);
    }

    // Processa cada chat individualmente
    for (const phone of Object.keys(batch)) {
        const msgsToAdd = batch[phone];
        const fileName = `${phone}.json.gz`;
        const filePath = path.join(CHATS_DIR, fileName);
        let history = [];

        try {
            if (fs.existsSync(filePath)) {
                const buffer = fs.readFileSync(filePath);
                const decompressed = await gunzip(buffer);
                history = JSON.parse(decompressed.toString());
            }

            // Adiciona novas (evitando duplicatas)
            const existingIds = new Set(history.map(m => m.key.id));

            let hasChanges = false;
            for (const m of msgsToAdd) {
                if (!existingIds.has(m.key.id)) {
                    history.push(m);
                    existingIds.add(m.key.id);
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                // Ordena por timestamp
                history.sort((a, b) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));

                // Mantém limite
                if (history.length > HISTORY_LIMIT) {
                    history = history.slice(-HISTORY_LIMIT);
                }

                const stringified = JSON.stringify(history);
                const compressed = await gzip(stringified);
                fs.writeFileSync(filePath, compressed);
            }

        } catch (err) {
            logger.error(`❌ Erro no Bulk Write para ${phone}:`, err.message);
        }
    }
}

/**
 * Recupera o histórico de mensagens descomprimido
 * @param {string} phone - Número do telefone (sem @s.whatsapp.net)
 * @returns {Array} Histórico de mensagens
 */
async function getHistory(phone) {
    if (!phone) return [];

    const fileName = `${phone}.json.gz`;
    const filePath = path.join(CHATS_DIR, fileName);

    try {
        if (!fs.existsSync(filePath)) return [];

        const buffer = fs.readFileSync(filePath);
        const decompressed = await gunzip(buffer);
        return JSON.parse(decompressed.toString());
    } catch (err) {
        logger.error(`❌ Erro ao ler histórico de ${phone}:`, err.message);
        return [];
    }
}

/**
 * Tenta resolver um JID (pode ser LID) para o telefone real consultando o índice ou lógica simples
 * @param {string} jid 
 * @returns {string|null} Phone number ou null
 */
function resolvePhoneFromJid(jid) {
    if (!jid) return null;

    if (jid.includes("@s.whatsapp.net")) {
        return jid.split("@")[0];
    }
    return null;
}

/**
 * Limpa todos os dados de chats (histórico e índice) do disco
 */
async function clearAllData() {
    try {
        if (fs.existsSync(CHATS_DIR)) {
            const files = fs.readdirSync(CHATS_DIR);
            for (const file of files) {
                fs.unlinkSync(path.join(CHATS_DIR, file));
            }
            logger.log("🧹 Todos os dados de histórico de chats foram apagados com sucesso.");
        }
    } catch (err) {
        logger.error("❌ Erro ao limpar dados de chats:", err.message);
    }
}

module.exports = {
    saveChatIndex,
    getRecentChatsFromIndex,
    addMessageToHistory,
    getHistory,
    resolvePhoneFromJid,
    clearAllData,
    bulkAddMessages,
    updateMessageReaction
};

/**
 * Atualiza a reação de uma mensagem no histórico
 * @param {string} phone - Número do chat
 * @param {string} targetId - ID da mensagem alvo
 * @param {string} reaction - Emoji da reação (ou null/vazio para remover)
 */
async function updateMessageReaction(phone, targetId, reaction) {
    if (!phone || !targetId) return;

    const fileName = `${phone}.json.gz`;
    const filePath = path.join(CHATS_DIR, fileName);

    try {
        if (!fs.existsSync(filePath)) return;

        const buffer = fs.readFileSync(filePath);
        const decompressed = await gunzip(buffer);
        let history = JSON.parse(decompressed.toString());

        const msgIndex = history.findIndex(m => m.key.id === targetId);

        if (msgIndex !== -1) {
            // Atualiza ou remove o campo reaction na mensagem original
            if (reaction) {
                history[msgIndex].reaction = reaction;
            } else {
                delete history[msgIndex].reaction;
            }

            // Salva apenas se achou
            const stringified = JSON.stringify(history);
            const compressed = await gzip(stringified);
            fs.writeFileSync(filePath, compressed);
        }
    } catch (err) {
        logger.error(`❌ Erro ao atualizar reação em ${phone}:`, err.message);
    }
}
