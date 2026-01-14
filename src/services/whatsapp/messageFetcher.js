const logger = require("../../utils/logger");
const client = require("./client");

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

    // Busca as mensagens do store em memória
    // Como habilitamos o syncFullHistoryLimit no constants.js, o store terá as mensagens recentes
    const store = client.getStore();
    const messages = await store.loadMessages(jid, limit);

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
        const messageType = Object.keys(m.message || {})[0] || "unknown";
        let text = "";

        // Extração de texto aprimorada
        const msg = m.message?.viewOnceMessage?.message || m.message?.viewOnceMessageV2?.message || m.message;

        if (msg?.conversation) {
            text = msg.conversation;
        } else if (msg?.extendedTextMessage?.text) {
            text = msg.extendedTextMessage.text;
        } else if (msg?.imageMessage) {
            text = msg.imageMessage.caption || "[image_message]";
        } else if (msg?.videoMessage) {
            text = msg.videoMessage.caption || "[video_message]";
        } else if (msg?.audioMessage) {
            text = "[audio_message]";
        } else if (msg?.stickerMessage) {
            text = "[sticker_message]";
        } else if (msg?.documentMessage) {
            text = msg.documentMessage.caption || `[document_message: ${msg.documentMessage.fileName || "arquivo"}]`;
        } else if (msg?.contactMessage) {
            text = `[contact_message: ${msg.contactMessage.displayName || "desconhecido"}]`;
        } else if (msg?.locationMessage) {
            text = "[location_message]";
        } else if (msg?.pollCreationMessage) {
            text = `[poll_message: ${msg.pollCreationMessage.name}]`;
        } else if (msg?.reactionMessage) {
            const reaction = msg.reactionMessage;
            if (reaction.key?.id) {
                reactionMap[reaction.key.id] = reaction.text;
            }
            text = `[reaction: ${reaction.text || "removida"}]`;
        } else if (msg?.buttonsMessage) {
            text = msg.buttonsMessage.contentText || "[button_message]";
        } else if (msg?.listMessage) {
            text = msg.listMessage.description || "[list_message]";
        } else if (msg?.templateMessage) {
            text = msg.templateMessage.hydratedTemplate?.hydratedContentText || "[template_message]";
        } else if (m.message?.messageContextInfo) {
            text = "[message_with_context]"; // Baileys placeholder para botões/estatísticas
        } else {
            text = `[${messageType}]`;
        }

        // Converte timestamp
        const timestamp = m.messageTimestamp?.low || m.messageTimestamp || null;

        return {
            id: m.key.id,
            fromMe: m.key.fromMe,
            pushName: m.pushName || null,
            text: text,
            timestamp: timestamp,
            mimetype: msg?.imageMessage?.mimetype ||
                msg?.videoMessage?.mimetype ||
                msg?.audioMessage?.mimetype ||
                msg?.documentMessage?.mimetype || null,
            type: messageType,
            hasButtons: !!(msg?.buttonsMessage || msg?.listMessage || msg?.templateMessage || msg?.buttonsResponseMessage || m.message?.messageContextInfo),
            reaction: null, // Será preenchido abaixo
            _raw: m // Mantendo para referência interna se necessário
        };
    });

    // Associa as reações às mensagens
    processedMessages.forEach(m => {
        if (reactionMap[m.id]) {
            m.reaction = reactionMap[m.id];
        }
    });

    let formattedMessages = processedMessages;

    // Filtros Avançados
    const { onlyReactions, reactionEmoji, query, onlyButtons } = arguments[3] || {};

    if (onlyReactions) {
        formattedMessages = formattedMessages.filter(m => m.type === "reactionMessage");
    }

    if (reactionEmoji) {
        formattedMessages = formattedMessages.filter(m => m.reaction === reactionEmoji);
    }

    if (query) {
        // Suporta múltiplas palavras separadas por ;
        const queries = query.split(";").map(q => q.trim().toLowerCase()).filter(q => q);
        formattedMessages = formattedMessages.filter(m => {
            if (!m.text) return false;
            const text = m.text.toLowerCase();
            return queries.some(q => text.includes(q));
        });
    }

    if (onlyButtons) {
        formattedMessages = formattedMessages.filter(m => m.hasButtons);
    }

    // Aplica filtro de tipo se necessário (sent/received)
    if (type === "sent") {
        formattedMessages = formattedMessages.filter(m => m.fromMe);
    } else if (type === "received") {
        formattedMessages = formattedMessages.filter(m => !m.fromMe);
    }

    // Inverte para as mais recentes virem primeiro
    formattedMessages.reverse();

    return {
        requested: limit,
        found: formattedMessages.length,
        messages: formattedMessages.slice(0, limit).map(({ _raw, ...rest }) => rest)
    };
}



/**
 * Obtém os contatos recentes da sessão atual
 * @param {number} limit - Quantidade máxima de contatos
 * @returns {Array}
 */
function getRecentChats(limit = 20) {
    const store = client.getStore();
    if (!store) return [];

    // O store.chats contém os metadados dos chats sincronizados na sessão
    const chats = store.chats.all();

    const formattedChats = chats.map(c => {
        const store = client.getStore();
        // Se for LID, tenta achar o JID real no store.contacts
        let id = c.id;
        let phone = id.split("@")[0];

        // No Baileys, LID e JID são diferentes. Se for LID, o "nome" ou metadados podem estar no store.contacts
        const contact = store.contacts[id];

        // Converte timestamp
        const timestamp = c.conversationTimestamp?.low || c.conversationTimestamp || null;

        return {
            id: id,
            phone: phone,
            name: c.name || contact?.name || contact?.verifiedName || contact?.notify || null,
            unreadCount: c.unreadCount || 0,
            lastMessageTimestamp: timestamp
        };
    })
        .filter(c => c.id.endsWith("@s.whatsapp.net") || c.id.endsWith("@g.us")) // Filtra LIDs
        .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

    return formattedChats.slice(0, limit);
}

module.exports = {
    fetchMessages,
    getRecentChats
};
