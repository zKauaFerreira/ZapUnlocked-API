const { parseMessage, shouldIgnoreMessage } = require("../utils/messageParser");
const { createStickerFromImage, convertStickerToImage } = require("./stickerHandler");
const { verifyAndDecodePayload } = require("../utils/callbackUtils");
const { triggerWebhook } = require("../services/webhookService");
const logger = require("../utils/logger");

/**
 * Handler principal para processar mensagens recebidas
 * @param {Object} sock - Socket do WhatsApp
 * @param {Object} msgUpsert - Dados da mensagem recebida
 */
async function handleMessage(sock, msgUpsert) {
  if (!msgUpsert.messages) return;
  const msg = msgUpsert.messages[0];

  // Ignora mensagens que devem ser ignoradas
  if (shouldIgnoreMessage(msg)) return;

  // Parseia a mensagem
  const parsed = parseMessage(msg);
  if (!parsed) return;

  const { jid, phone, text, imageMessage, quotedImage, quotedSticker, buttonResponse, quotedMessage } = parsed;

  const messageText = text || "";

  // ================== CALLBACK DE WEBHOOK NO BOTÃO (|cb=) ==================

  if (messageText.includes("|cb=")) {
    const parts = messageText.split("|cb=");
    const buttonLabel = parts[0];
    const token = parts[1];

    const webhookConfig = verifyAndDecodePayload(token);

    if (webhookConfig) {
      logger.log(`🎯 Callback detectado no botão: "${buttonLabel}" de ${phone}`);

      // Dispara o webhook em background (não aguarda para não travar o bot)
      triggerWebhook(webhookConfig, {
        from: phone,
        text: buttonLabel
      }).catch(err => logger.error("Erro ao disparar webhook:", err.message));
    } else {
      logger.warn(`⚠️ Callback inválido ou expirado recebido de ${phone}`);
    }

    // Se for um clique de botão com callback, podemos parar o processamento aqui
    // se não quisermos que caia em outros comandos
    return;
  }

  // Debug: log quando detecta .f no texto
  if (text.includes(".f")) {
    logger.log(`🔍 Debug .f: text="${text}", hasImage=${!!imageMessage}, hasQuoted=${!!quotedMessage}, hasQuotedImage=${!!quotedImage}`);
  }

  // ================== COMANDO .f (Criar Figurinha) ==================

  // Caso 1: Imagem com legenda contendo .f (ex: "minha foto .f" ou apenas ".f")
  // Verifica se há imagem na mensagem atual E se o texto contém .f
  if (imageMessage && text.includes(".f")) {
    logger.log("✅ Caso 1: Imagem com .f na legenda");
    await createStickerFromImage(sock, jid, msg, imageMessage, false);
    return;
  }

  // Caso 2: Responder qualquer mensagem com .f
  // Quando você responde, verifica se há mensagem citada que é uma imagem
  // E se o texto da resposta contém .f
  if (quotedMessage && quotedImage && text.includes(".f")) {
    logger.log("✅ Caso 2: Resposta com .f para imagem citada");
    await createStickerFromImage(sock, jid, msg, quotedImage, true);
    return;
  }

  // ================== COMANDO .t (Converter Figurinha em Foto) ==================

  if (quotedSticker && text === ".t") {
    await convertStickerToImage(sock, jid, msg, quotedSticker);
    return;
  }

}

module.exports = { handleMessage };
