const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@itsukichan/baileys");
const { AUTH_DIR, WHATSAPP_CONFIG, RECONNECT_DELAY } = require("../config/constants");
const { handleMessage } = require("../handlers/messageHandler");
const logger = require("../utils/logger");

let sock = null;
let isReady = false;
let currentQR = null; // Armazena o QR code atual

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

    sock.ev.on("creds.update", async () => {
      await saveCreds();
      logger.log("💾 Credenciais do WhatsApp atualizadas/salvas");
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Captura o QR code quando gerado
      if (qr) {
        currentQR = qr;
        logger.log("📲 QR Code gerado! Acesse /qr no navegador para escanear");
      }

      if (connection === "open") {
        isReady = true;
        currentQR = null; // Limpa o QR code quando conectado
        logger.log("✅ WhatsApp conectado e pronto");
      }

      if (connection === "close") {
        isReady = false;
        currentQR = null; // Limpa o QR code quando desconecta
        const reason = lastDisconnect?.error?.output?.statusCode;
        logger.log("⚠️ Conexão fechou:", reason);

        if (reason !== DisconnectReason.loggedOut) {
          logger.log(`🔄 Tentando reconectar em ${RECONNECT_DELAY / 1000}s...`);
          setTimeout(startBot, RECONNECT_DELAY);
        } else {
          logger.error("❌ Sessão inválida, precisa gerar novamente");
        }
      }
    });

    // Handler de mensagens
    sock.ev.on("messages.upsert", async (msgUpsert) => {
      await handleMessage(sock, msgUpsert);
    });
  } catch (error) {
    logger.error("❌ Erro ao iniciar bot:", error.message);
    setTimeout(startBot, RECONNECT_DELAY);
  }
}

/**
 * Envia uma mensagem de texto via WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {string} message - Texto da mensagem
 * @returns {Promise<Object>}
 */
async function sendMessage(jid, message) {
  if (!sock || !isReady) {
    throw new Error("WhatsApp não está conectado");
  }

  return await sock.sendMessage(jid, { text: message });
}

/**
 * Envia uma mensagem com botão customizado via WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {string} message - Texto da mensagem
 * @param {string} buttonText - Texto que aparece no botão
 * @param {string} buttonValue - Valor enviado ao clicar no botão
 * @returns {Promise<Object>}
 */
async function sendButtonMessage(jid, message, buttonText, buttonValue) {
  if (!sock || !isReady) {
    throw new Error("WhatsApp não está conectado");
  }

  return await sock.sendMessage(jid, {
    text: message,
    buttons: [
      {
        buttonId: buttonValue,
        buttonText: { displayText: buttonText },
        type: 1
      }
    ],
    headerType: 1
  });
}

/**
 * Envia uma imagem via WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {string} imagePath - Caminho local da imagem
 * @param {string} caption - Legenda da imagem
 * @param {boolean} viewOnce - Se é visualização única
 * @returns {Promise<Object>}
 */
async function sendImageMessage(jid, imagePath, caption, viewOnce = false) {
  if (!sock || !isReady) {
    throw new Error("WhatsApp não está conectado");
  }

  return await sock.sendMessage(jid, {
    image: { url: imagePath },
    caption: caption,
    viewOnce: viewOnce
  });
}

/**
 * Verifica se o WhatsApp está pronto
 * @returns {boolean}
 */
function getStatus() {
  return isReady;
}

/**
 * Obtém a instância do socket
 * @returns {Object|null}
 */
function getSocket() {
  return sock;
}

/**
 * Obtém o QR code atual (se disponível)
 * @returns {string|null}
 */
function getQRCode() {
  return currentQR;
}

module.exports = {
  startBot,
  sendMessage,
  sendButtonMessage,
  sendImageMessage,
  getStatus,
  getSocket,
  getQRCode
};
