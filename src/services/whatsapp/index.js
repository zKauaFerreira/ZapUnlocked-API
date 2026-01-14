const client = require("./client");
const sender = require("./sender");
const fetcher = require("./messageFetcher");

module.exports = {
    // Client Connection
    startBot: client.startBot,
    logout: client.logout,
    getStatus: client.isReady,
    getSocket: client.getSock,
    getQRCode: client.getQR,
    getStore: client.getStore,

    // Message Sending
    sendMessage: sender.sendMessage,
    sendButtonMessage: sender.sendButtonMessage,
    sendImageMessage: sender.sendImageMessage,
    sendAudioMessage: sender.sendAudioMessage,
    sendVideoMessage: sender.sendVideoMessage,
    sendDocumentMessage: sender.sendDocumentMessage,
    sendStickerMessage: sender.sendStickerMessage,

    // Management & History
    fetchMessages: fetcher.fetchMessages,
    getRecentChats: fetcher.getRecentChats,

    // Reactions & Helpers
    sendReaction: sender.sendReaction,
    findMessage: sender.findMessage
};
