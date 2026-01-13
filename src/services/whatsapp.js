const fs = require("fs");
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
 * @returns {Promise<Object>}
 */
async function sendImageMessage(jid, imagePath, caption) {
  logger.log(`📡 Chamando Baileys sendMessage para ${jid}`);
  if (!sock || !isReady) {
    throw new Error("WhatsApp não está conectado");
  }

  return await sock.sendMessage(jid, {
    image: fs.readFileSync(imagePath),
    caption: caption
  });
}

const { getAudioDuration, generateWaveform } = require("baileys-original");

/**
 * Envia um áudio via WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {string} audioPath - Caminho local do áudio
 * @param {boolean} isPtt - Se envia como mensagem de voz
 * @returns {Promise<Object>}
 */
async function sendAudioMessage(jid, audioPath, isPtt = false) {
  logger.log(`📡 Enviando áudio para ${jid} (PTT: ${isPtt})`);
  if (!sock || !isReady) {
    throw new Error("WhatsApp não está conectado");
  }

  const buffer = fs.readFileSync(audioPath);

  // Calcula duração e waveform para compatibilidade com iPhone
  let seconds = undefined;
  let waveform = undefined;

  try {
    seconds = await getAudioDuration(buffer);
    waveform = await generateWaveform(buffer);
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
 * Envia um vídeo via WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {string} videoPath - Caminho local do vídeo
 * @param {string} caption - Legenda
 * @param {boolean} asDocument - Se envia como arquivo
 * @param {boolean} gifPlayback - Se envia como GIF
 * @param {boolean} ptv - Se envia como vídeo redondo (curto)
 * @returns {Promise<Object>}
 */
async function sendVideoMessage(jid, videoPath, caption, asDocument = false, gifPlayback = false, ptv = false) {
  logger.log(`📡 Enviando vídeo para ${jid} (Document: ${asDocument}, GIF: ${gifPlayback}, PTV: ${ptv})`);
  if (!sock || !isReady) {
    throw new Error("WhatsApp não está conectado");
  }

  const messageOptions = {
    caption: caption
  };

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
 * Envia um documento via WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {string} filePath - Caminho local do arquivo
 * @param {string} fileName - Nome original do arquivo
 * @param {string} mimetype - Tipo MIME
 * @returns {Promise<Object>}
 */
async function sendDocumentMessage(jid, filePath, fileName, mimetype) {
  logger.log(`📡 Enviando documento para ${jid} (${fileName})`);
  if (!sock || !isReady) {
    throw new Error("WhatsApp não está conectado");
  }

  return await sock.sendMessage(jid, {
    document: fs.readFileSync(filePath),
    fileName: fileName,
    mimetype: mimetype || "application/octet-stream"
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
  sendAudioMessage,
  sendVideoMessage,
  sendDocumentMessage,
  getStatus,
  getSocket,
  getQRCode
};
