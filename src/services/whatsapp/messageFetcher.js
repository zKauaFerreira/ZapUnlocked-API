const logger = require("../../utils/logger");
const client = require("./client");
const storage = require("./storage");

/**
 * Busca mensagens do WhatsApp sob demanda
 * @param {string} jid - JID do contato
 * @param {number} limit - Quantidade de mensagens (max 100)
 * @param {string} type - Tipo de mensagens ('sent', 'received', 'all')
 * @returns {Promise<Object>}
 */
async function fetchMessages(jid, limit = 20, type = "all") {
    const sock = client.getSock();
    if (!sock) throw new Error("WhatsApp não conectado");

    logger.log(`🔍 Buscando ${limit} mensagens (${type}) para ${jid}...`);

    const phone = jid.split("@")[0];
    const messages = await storage.getHistory(phone);

    if (!messages || messages.length === 0) {
        return {
            requested: limit,
            found: 0,
            messages: []
        };
    }

    // Mapa para associar reações às mensagens originais
    const reactionMap = {};
    const processedMessages = messages.map(m => {
        // Ignora metadados de contexto para determinar o tipo real da mensagem
        const msgKeys = Object.keys(m.message || {}).filter(k => k !== "messageContextInfo" && k !== "senderKeyDistributionMessage");
        const messageType = msgKeys[0] || "unknown";
        let text = "";

        // Extração de texto aprimorada
        const msg = m.message?.viewOnceMessage?.message || m.message?.viewOnceMessageV2?.message || m.message;

        // Verifica se a mensagem é um reply/context e busca o conteúdo real
        const content = msg?.extendedTextMessage || msg;

        if (content?.conversation) {
            text = content.conversation;
        } else if (content?.extendedTextMessage?.text || content?.text) {
            text = content?.extendedTextMessage?.text || content?.text;
        } else if (content?.imageMessage) {
            text = content.imageMessage.caption || "[image_message]";
        } else if (content?.videoMessage) {
            text = content.videoMessage.caption || "[video_message]";
        } else if (content?.audioMessage) {
            text = "[audio_message]";
        } else if (content?.stickerMessage) {
            text = "[sticker_message]";
        } else if (content?.documentMessage) {
            text = content.documentMessage.caption || `[document_message: ${content.documentMessage.fileName || "arquivo"}]`;
        } else if (content?.contactMessage) {
            text = `[contact_message: ${content.contactMessage.displayName || "desconhecido"}]`;
        } else if (content?.locationMessage) {
            text = "[location_message]";
        } else if (content?.pollCreationMessage) {
            text = `[poll_message: ${content.pollCreationMessage.name}]`;
        } else if (content?.reactionMessage) {
            const reaction = content.reactionMessage;
            if (reaction.key?.id) {
                reactionMap[reaction.key.id] = reaction.text;
            }
            text = `[reaction: ${reaction.text || "removida"}]`;
        } else if (content?.buttonsMessage) {
            text = content.buttonsMessage.contentText || "[button_message]";
        } else if (content?.listMessage) {
            text = content.listMessage.description || "[list_message]";
        } else if (content?.templateMessage) {
            text = content.templateMessage.hydratedTemplate?.hydratedContentText || "[template_message]";
        } else {
            text = `[${messageType}]`;
        }

        // Converte timestamp
        const timestamp = m.messageTimestamp?.low || m.messageTimestamp || null;

        // Identificação real de botões
        const hasButtons = !!(
            msg?.buttonsMessage ||
            msg?.listMessage ||
            msg?.templateMessage ||
            msg?.buttonsResponseMessage ||
            msg?.listResponseMessage ||
            msg?.interactiveMessage
        );

        return {
            id: m.key.id,
            fromMe: m.key.fromMe,
            pushName: m.pushName || null,
            text: text,
            timestamp: timestamp,
            mimetype: content?.imageMessage?.mimetype ||
                content?.videoMessage?.mimetype ||
                content?.audioMessage?.mimetype ||
                content?.documentMessage?.mimetype || null,
            type: messageType,
            hasButtons: hasButtons,
            reaction: null, // Será preenchido abaixo
            _raw: m
        };
    });

    // Associa as reações às mensagens (usa o cache global + local)
    const globalReactionCache = client.getReactionCache();
    processedMessages.forEach(m => {
        const cachedReaction = globalReactionCache.get(m.id);
        if (cachedReaction) {
            m.reaction = cachedReaction;
        } else if (reactionMap[m.id]) {
            m.reaction = reactionMap[m.id];
        }
    });

    let filteredMessages = processedMessages;

    // Filtros Avançados
    const { onlyReactions, reactionEmoji, query, onlyButtons } = arguments[3] || {};

    if (onlyReactions) {
        filteredMessages = filteredMessages.filter(m => m.type === "reactionMessage");
    }

    if (reactionEmoji) {
        filteredMessages = filteredMessages.filter(m => m.reaction === reactionEmoji);
    }

    if (query) {
        const queries = query.split(";").map(q => q.trim().toLowerCase()).filter(q => q);
        filteredMessages = filteredMessages.filter(m => {
            if (!m.text) return false;
            const textContent = m.text.toLowerCase();
            return queries.some(q => textContent.includes(q));
        });
    }

    if (onlyButtons) {
        filteredMessages = filteredMessages.filter(m => m.hasButtons);
    }

    // Aplica filtro de tipo (sent/received)
    if (type === "sent") {
        filteredMessages = filteredMessages.filter(m => m.fromMe);
    } else if (type === "received") {
        filteredMessages = filteredMessages.filter(m => !m.fromMe);
    }

    // Inverte para as mais recentes virem primeiro
    filteredMessages.reverse();

    return {
        requested: limit,
        found: Math.min(filteredMessages.length, limit),
        total_found: filteredMessages.length,
        messages: filteredMessages.slice(0, limit).map(({ _raw, ...rest }) => rest)
    };
}

/**
 * Obtém os contatos recentes da sessão atual
 * @param {number} limit - Quantidade máxima de contatos
 * @returns {Array}
 */
function getRecentChats(limit = 20) {
    const chats = storage.getRecentChatsFromIndex();
    return chats.slice(0, limit);
}

module.exports = {
    fetchMessages,
    getRecentChats
};
