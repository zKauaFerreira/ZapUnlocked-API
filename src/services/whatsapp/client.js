const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    makeInMemoryStore
} = require("@itsukichan/baileys");
const fs = require("fs");
const path = require("path");
const { AUTH_DIR, WHATSAPP_CONFIG, RECONNECT_DELAY } = require("../../config/constants");
const { handleMessage } = require("../../handlers/messageHandler");
const logger = require("../../utils/logger");
const storage = require("./storage");

let sock = null;
let isReady = false;
let currentQR = null;

// Store em memória (mantido para contatos e metadados, mas mensagens vão para storage)
const store = makeInMemoryStore({});

// Cache global de reações (messageId -> emoji)
const reactionCache = new Map();

const MAX_REACTIONS_IN_CACHE = 5000;

/**
 * Armazena uma reação no cache global
 */
function storeReaction(targetId, emoji) {
    if (!targetId) return;

    // Se o emoji for vazio, a reação foi removida
    if (!emoji) {
        reactionCache.delete(targetId);
        return;
    }

    // Gerenciamento de memória do cache
    if (reactionCache.size >= MAX_REACTIONS_IN_CACHE) {
        const firstKey = reactionCache.keys().next().value;
        reactionCache.delete(firstKey);
    }

    reactionCache.set(targetId, emoji);
}

/**
 * Inicia o bot do WhatsApp
 * @returns {Promise<void>}
 */
async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            auth: state,
            ...WHATSAPP_CONFIG
        });

        // Vincula o store ao socket
        store.bind(sock.ev);

        sock.ev.on("creds.update", async () => {
            await saveCreds();
            logger.log("💾 Credenciais do WhatsApp atualizadas/salvas");
        });

        sock.ev.on("messaging.history-set", ({ messages }) => {
            logger.log(`📚 Sincronismo de histórico recebido: ${messages.length} mensagens.`);
        });

        // Captura reações via evento dedicado (messages.reaction)
        sock.ev.on("messages.reaction", (reactions) => {
            for (const r of reactions) {
                const targetId = r.reaction?.key?.id;
                const emoji = r.reaction?.text;
                if (targetId) {
                    storeReaction(targetId, emoji);
                }
            }
        });

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                currentQR = qr;
                logger.log("📲 QR Code gerado! Acesse /qr no navegador para escanear");
            }

            if (connection === "open") {
                isReady = true;
                currentQR = null;
                logger.log("✅ WhatsApp conectado e pronto");
            }

            if (connection === "close") {
                isReady = false;
                currentQR = null;
                const reason = lastDisconnect?.error?.output?.statusCode;
                logger.log("⚠️ Conexão fechou:", reason);

                if (reason !== DisconnectReason.loggedOut) {
                    logger.log(`🔄 Tentando reconectar em ${RECONNECT_DELAY / 1000}s...`);
                    setTimeout(startBot, RECONNECT_DELAY);
                } else {
                    logger.error("❌ Sessão inválida (401), limpando e reiniciando...");
                    logout();
                }
            }
        });

        sock.ev.on("messages.upsert", async (msgUpsert) => {
            // Log para debug de mensagens em tempo real
            for (const m of msgUpsert.messages) {
                let jid = m.key.remoteJid;

                // Ignora status/broadcasts
                if (jid === "status@broadcast") continue;

                // Tenta lidar com LID (Linked Device)
                if (jid.includes("@lid")) {
                    // Tenta resolver para o número real se possível.
                    const resolved = storage.resolvePhoneFromJid(jid);
                    if (resolved) {
                        // Opcional: atualizar jid se necessário, mas o phone é extraído abaixo
                    }
                }

                const phone = jid.split("@")[0];

                // Salva no Storage (GZIP)
                await storage.addMessageToHistory(phone, m);

                // Atualiza Índice de Chats
                const chatInfo = {
                    id: jid.includes("@lid") ? `${phone}@s.whatsapp.net` : jid,
                    phone: phone,
                    name: m.pushName || store.contacts[jid]?.name || store.contacts[jid]?.notify || null,
                    lastMessageTimestamp: m.messageTimestamp?.low || m.messageTimestamp
                };
                await storage.saveChatIndex(chatInfo);

                logger.log(`📩 UPSERT salvo no storage: ${phone} (Tipo: ${Object.keys(m.message || {})[0]})`);

                const jidLog = m.key.remoteJid;
                if (jidLog) {
                    const after = (await storage.getHistory(phone)).length;
                    logger.log(`📩 UPSERT: ${jidLog}. Total no arquivo: ${after}`);
                }

                // Captura reações que chegam como mensagens normais
                const reaction = m.message?.reactionMessage;
                if (reaction) {
                    const targetId = reaction.key?.id;
                    const emoji = reaction.text;
                    storeReaction(targetId, emoji);
                }
            }

            await handleMessage(sock, msgUpsert);
        });
    } catch (error) {
        logger.error("❌ Erro ao iniciar bot:", error.message);
        setTimeout(startBot, RECONNECT_DELAY);
    }
}

/**
 * Faz logout e limpa a sessão
 */
async function logout() {
    logger.log("🗑️ Iniciando processo de logout e limpeza de sessão...");

    try {
        if (sock) {
            if (isReady) {
                try {
                    await sock.logout();
                } catch (e) { }
            }
            sock.ev.removeAllListeners();
            sock = null;
        }
    } catch (err) {
        logger.error("⚠️ Erro ao fechar socket:", err.message);
    }

    isReady = false;
    currentQR = null;

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (fs.existsSync(AUTH_DIR)) {
        try {
            const files = fs.readdirSync(AUTH_DIR);
            for (const file of files) {
                const filePath = path.join(AUTH_DIR, file);
                try {
                    fs.unlinkSync(filePath);
                } catch (err) { }
            }
            try {
                fs.rmdirSync(AUTH_DIR);
            } catch (err) { }
        } catch (err) { }
    }

    // Limpa o histórico de mensagens do disco (Storage)
    await storage.clearAllData();

    logger.log("🔄 Reiniciando bot para novo escaneamento...");
    setTimeout(startBot, 2000);
}

module.exports = {
    startBot,
    logout,
    getSock: () => sock,
    isReady: () => isReady,
    getQR: () => currentQR,
    getStore: () => store,
    getReactionCache: () => reactionCache
};
