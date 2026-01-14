const fs = require("fs");
const { getAudioDuration, getAudioWaveform } = require("baileys-original");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const logger = require("../../utils/logger");
const { getSock, isReady } = require("./client");

/**
 * Envia uma mensagem de texto via WhatsApp
 */
async function sendMessage(jid, message, options = {}) {
    const sock = getSock();
    if (!sock || !isReady()) throw new Error("WhatsApp não está conectado");

    const messageContent = { text: message };
    const sendOptions = {};
    if (options.quoted) sendOptions.quoted = options.quoted;

    return await sock.sendMessage(jid, messageContent, sendOptions);
}

/**
 * Envia uma mensagem com botão customizado
 */
async function sendButtonMessage(jid, message, buttonText, buttonValue, options = {}) {
    const sock = getSock();
    if (!sock || !isReady()) throw new Error("WhatsApp não está conectado");

    const messageContent = {
        text: message,
        buttons: [
            {
                buttonId: buttonValue,
                buttonText: { displayText: buttonText },
                type: 1
            }
        ],
        headerType: 1
    };

    const sendOptions = {};
    if (options.quoted) sendOptions.quoted = options.quoted;

    return await sock.sendMessage(jid, messageContent, sendOptions);
}

/**
 * Envia uma imagem
 */
async function sendImageMessage(jid, imagePath, caption) {
    const sock = getSock();
    if (!sock || !isReady()) throw new Error("WhatsApp não está conectado");
    return await sock.sendMessage(jid, {
        image: fs.readFileSync(imagePath),
        caption: caption
    });
}

/**
 * Envia um áudio
 */
async function sendAudioMessage(jid, audioPath, isPtt = false) {
    const sock = getSock();
    if (!sock || !isReady()) throw new Error("WhatsApp não está conectado");

    const buffer = fs.readFileSync(audioPath);
    let seconds = undefined;
    let waveform = undefined;

    try {
        seconds = await getAudioDuration(buffer);
        waveform = await getAudioWaveform(buffer);
    } catch (err) {
        logger.log(`⚠️ Falha ao gerar metadados de áudio: ${err.message}`);
    }

    return await sock.sendMessage(jid, {
        audio: buffer,
        ptt: isPtt,
        mimetype: "audio/ogg; codecs=opus",
        seconds: seconds,
        waveform: waveform
    });
}

/**
 * Envia um vídeo
 */
async function sendVideoMessage(jid, videoPath, caption, asDocument = false, gifPlayback = false, ptv = false) {
    const sock = getSock();
    if (!sock || !isReady()) throw new Error("WhatsApp não está conectado");

    const messageOptions = { caption: caption };

    if (asDocument) {
        messageOptions.document = fs.readFileSync(videoPath);
        messageOptions.mimetype = "video/mp4";
        messageOptions.fileName = `video_${Date.now()}.mp4`;
    } else {
        messageOptions.video = fs.readFileSync(videoPath);
        messageOptions.gifPlayback = gifPlayback;
        messageOptions.ptv = ptv;
    }

    return await sock.sendMessage(jid, messageOptions);
}

/**
 * Envia um documento
 */
async function sendDocumentMessage(jid, filePath, fileName, mimetype) {
    const sock = getSock();
    if (!sock || !isReady()) throw new Error("WhatsApp não está conectado");

    return await sock.sendMessage(jid, {
        document: fs.readFileSync(filePath),
        fileName: fileName,
        mimetype: mimetype || "application/octet-stream"
    });
}

/**
 * Envia uma figurinha (sticker)
 */
async function sendStickerMessage(jid, stickerPath, pack, author) {
    const sock = getSock();
    if (!sock || !isReady()) throw new Error("WhatsApp não está conectado");

    const sticker = new Sticker(fs.readFileSync(stickerPath), {
        pack: pack || "",
        author: author || "",
        type: StickerTypes.FULL,
        quality: 100
    });

    const buffer = await sticker.toBuffer();

    return await sock.sendMessage(jid, {
        sticker: buffer
    });
}

async function findMessage(jid, identifier, type = "id") {
    const storage = require("./storage");

    // Extrai o telefone do JID para buscar no arquivo correto
    const phone = jid.split("@")[0];

    // Busca mensagens do histórico (já descomprimido)
    const msgs = await storage.getHistory(phone);

    if (!msgs || msgs.length === 0) return null;

    if (type === "text") {
        // Busca a mais recente que contenha o texto exato
        // Como o getHistory retorna ordenado (antigo -> novo), invertemos para pegar o mais recente
        return [...msgs].reverse().find(m => {
            // Lógica de extração de texto robusta (igual ao messageFetcher)
            const msg = m.message?.viewOnceMessage?.message ||
                m.message?.viewOnceMessageV2?.message ||
                m.message;

            const content = msg?.extendedTextMessage || msg;
            let text = "";

            if (content?.conversation) {
                text = content.conversation;
            } else if (content?.extendedTextMessage?.text || content?.text) {
                text = content?.extendedTextMessage?.text || content?.text;
            } else if (content?.imageMessage) {
                text = content.imageMessage.caption || "";
            } else if (content?.videoMessage) {
                text = content.videoMessage.caption || "";
            }

            // Comparação exata (trim + case insensitive)
            return text && text.trim().toLowerCase() === identifier.trim().toLowerCase();
        });
    } else {
        // Busca pelo ID
        return msgs.find(m => m.key.id === identifier);
    }
}

/**
 * Envia uma reação para uma mensagem específica
 */
async function sendReaction(jid, identifier, emoji, type = "id") {
    const sock = getSock();
    if (!sock || !isReady()) throw new Error("WhatsApp não está conectado");

    const found = await findMessage(jid, identifier, type);

    // Se for por ID e não encontrar, ainda tentamos reagir (pode ser stub)
    let targetId = identifier;
    let fromMe = false;

    if (found) {
        targetId = found.key.id;
        fromMe = found.key.fromMe;
    } else if (type === "text") {
        throw new Error(`Nenhuma mensagem recente encontrada com o texto: "${identifier}"`);
    }

    return await sock.sendMessage(jid, {
        react: {
            text: emoji,
            key: {
                remoteJid: jid,
                fromMe: fromMe,
                id: targetId
            }
        }
    });
}

module.exports = {
    sendMessage,
    sendButtonMessage,
    sendImageMessage,
    sendAudioMessage,
    sendVideoMessage,
    sendDocumentMessage,
    sendStickerMessage,
    sendReaction,
    findMessage
};
