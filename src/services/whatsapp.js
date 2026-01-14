const fs = require("fs");
const path = require("path");
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
          logger.error("❌ Sessão inválida (401), limpando e reiniciando...");
          logout(); // Chama o processo robusto de logout para pedir novo QR
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

const { getAudioDuration, getAudioWaveform } = require("baileys-original");

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
 * Envia uma figurinha (sticker) via WhatsApp
 * @param {string} jid - JID do destinatário
 * @param {string} stickerPath - Caminho local do arquivo .webp
 * @returns {Promise<Object>}
 */
async function sendStickerMessage(jid, stickerPath) {
  logger.log(`📡 Enviando figurinha para ${jid}`);
  if (!sock || !isReady) {
    throw new Error("WhatsApp não está conectado");
  }

  return await sock.sendMessage(jid, {
    sticker: fs.readFileSync(stickerPath)
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

/**
 * Faz logout e limpa a sessão
 * @returns {Promise<void>}
 */
async function logout() {
  logger.log("🗑️ Iniciando processo de logout e limpeza de sessão...");

  try {
    if (sock) {
      // Caso esteja conectado, tenta encerrar a sessão no servidor
      if (isReady) {
        try {
          await sock.logout();
        } catch (e) {
          logger.log("⚠️ Erro ao tentar sock.logout() (provavelmente já desconectado)");
        }
      }
      // Remove todos os listeners para evitar callbacks indesejados durante o cleanup
      sock.ev.removeAllListeners();
      sock = null;
    }
  } catch (err) {
    logger.error("⚠️ Erro ao fechar socket:", err.message);
  }

  isReady = false;
  currentQR = null;

  // Aguarda 1 segundo para garantir que o SO liberou os file handles do Baileys
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Limpa o conteúdo do diretório de autenticação de forma granular
  if (fs.existsSync(AUTH_DIR)) {
    try {
      const files = fs.readdirSync(AUTH_DIR);
      for (const file of files) {
        const filePath = path.join(AUTH_DIR, file);
        try {
          fs.unlinkSync(filePath);
          logger.log(`🗑️ Arquivo de sessão removido: ${file}`);
        } catch (err) {
          if (err.code === "EBUSY") {
            logger.log(`⚠️ Arquivo ${file} ocupado, pulando...`);
          } else {
            logger.error(`❌ Erro ao remover ${file}:`, err.message);
          }
        }
      }

      // Tenta remover o diretório vazio no final (rmSync com recursive:true pode falhar se algum arquivo sobrou)
      try {
        fs.rmdirSync(AUTH_DIR);
        logger.log("✅ Diretório de autenticação removido com sucesso");
      } catch (err) {
        // Se falhar o rmdir por estar ocupado, não é crítico se os arquivos (especialmente creds.json) saíram
        logger.log("ℹ️ Diretório base não pôde ser removido (ocupado), mas arquivos internos foram processados.");
      }
    } catch (err) {
      logger.error("❌ Erro ao ler diretório de autenticação:", err.message);
    }
  }

  // Reinicia o bot em um novo ciclo para esperar novo scan
  logger.log("🔄 Reiniciando bot para novo escaneamento...");
  setTimeout(startBot, 2000);
}

module.exports = {
  startBot,
  sendMessage,
  sendButtonMessage,
  sendImageMessage,
  sendAudioMessage,
  sendVideoMessage,
  sendDocumentMessage,
  sendStickerMessage,
  getStatus,
  getSocket,
  getQRCode,
  logout
};
