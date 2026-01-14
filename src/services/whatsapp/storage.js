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

    // Se for @s.whatsapp.net, é direto
    if (jid.includes("@s.whatsapp.net")) {
        return jid.split("@")[0];
    }

    // Se for LID, precisamos de uma estratégia de busca.
    // Por enquanto, tentaremos ver se temos esse LID mapeado no índice de chats (se um dia foi salvo com metadados)
    // Caso contrário, retornamos null e esperamos que o endpoint de contatos preencha isso.
    // NOTA: O Client deve passar o mapeamento correto se tiver acesso ao Store do Baileys.

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
                // Apaga tudo dentro de data/chats
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
    clearAllData
};
