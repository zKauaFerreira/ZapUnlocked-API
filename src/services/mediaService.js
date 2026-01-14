const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { TEMP_DIR } = require("../config/constants");
const logger = require("../utils/logger");

// Configura o caminho do ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Serviço para download e limpeza de mídias temporárias
 */

const MAX_SIZE = 400 * 1024 * 1024; // 400 MB (Limite solicitado pelo usuário)

/**
 * Faz download de uma mídia de uma URL
 * @param {string} url - URL da mídia
 * @returns {Promise<string>} - Caminho local do arquivo salvo
 */
async function downloadMedia(url) {
    logger.log(`🌐 Iniciando download da URL: ${url}`);

    try {
        const commonHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Referer": "https://www.google.com/"
        };

        // Primeiro tentamos obter o tamanho do arquivo via HEAD
        let contentLength = 0;
        try {
            const headResponse = await axios.head(url, {
                headers: commonHeaders,
                timeout: 5000,
                validateStatus: (status) => status < 400 // Aceita qualquer status abaixo de 400
            });
            contentLength = parseInt(headResponse.headers["content-length"] || 0);
        } catch (e) {
            logger.log(`⚠️ HEAD falhou (${e.message}), tentando via GET...`);
        }

        if (contentLength > MAX_SIZE) {
            const sizeMB = (contentLength / (1024 * 1024)).toFixed(2);
            throw new Error(`Arquivo muito grande: ${sizeMB}MB. O limite máximo é 400MB.`);
        }

        const response = await axios({
            method: "get",
            url: url,
            responseType: "stream",
            headers: commonHeaders,
            timeout: 60000 // 60 segundos para downloads maiores
        });

        // Se não pegou via HEAD, verifica agora
        const actualSize = parseInt(response.headers["content-length"] || 0);
        if (actualSize > MAX_SIZE) {
            const sizeMB = (actualSize / (1024 * 1024)).toFixed(2);
            throw new Error(`Arquivo muito grande: ${sizeMB}MB. O limite máximo é 400MB.`);
        }

        // Tenta detectar a extensão correta ou usa o padrão
        const contentType = response.headers["content-type"] || "";
        let extension = ".bin";

        if (contentType.includes("image/")) extension = "." + contentType.split("/")[1].split(";")[0];
        else if (contentType.includes("video/")) extension = "." + contentType.split("/")[1].split(";")[0];
        else if (contentType.includes("audio/")) extension = "." + contentType.split("/")[1].split(";")[0];
        else if (contentType.includes("application/pdf")) extension = ".pdf";

        // Correções comuns
        if (extension === ".jpeg") extension = ".jpg";
        if (extension === ".mpeg") {
            // Se for audio/mpeg é MP3, se for video/mpeg é MP4 (geralmente)
            extension = contentType.includes("audio") ? ".mp3" : ".mp4";
        }
        if (extension === ".ogg") extension = ".ogg";

        const filename = `${crypto.randomUUID()}${extension}`;
        const filePath = path.join(TEMP_DIR, filename);
        const writer = fs.createWriteStream(filePath);

        logger.log(`⏳ Gravando stream no arquivo: ${filename}...`);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                const stats = fs.statSync(filePath);
                logger.log(`✅ Download concluído: ${path.basename(filePath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
                resolve(filePath);
            });
            writer.on("error", (err) => {
                logger.error("❌ Erro no writer do stream:", err.message);
                cleanupLocal(filePath);
                reject(err);
            });
            response.data.on("error", (err) => {
                logger.error("❌ Erro no stream de dados:", err.message);
                cleanupLocal(filePath);
                reject(err);
            });
        });
    } catch (error) {
        logger.error("❌ Erro ao baixar mídia:", error.message);
        throw error;
    }
}

/**
 * Converte um arquivo de áudio para OGG/Opus (formato nativo do WhatsApp)
 * @param {string} inputPath - Caminho do arquivo original
 * @returns {Promise<string>} - Caminho do novo arquivo .ogg
 */
async function convertToOgg(inputPath) {
    const outputPath = inputPath.replace(path.extname(inputPath), ".ogg");
    logger.log(`🔄 Convertendo áudio para OGG/Opus: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .noVideo()
            .audioChannels(1)
            .audioFrequency(48000)
            .audioCodec("libopus")
            .toFormat("ogg")
            .addOptions([
                "-avoid_negative_ts", "make_zero"
            ])
            .on("end", () => {
                logger.log("✅ Conversão concluída com sucesso");
                resolve(outputPath);
            })
            .on("error", (err) => {
                logger.error("❌ Erro na conversão de áudio:", err.message);
                reject(err);
            })
            .save(outputPath);
    });
}

/**
 * Converte uma imagem para WebP (formato de sticker do WhatsApp - 512x512)
 * @param {string} inputPath - Caminho do arquivo original
 * @returns {Promise<string>} - Caminho do arquivo .webp
 */
async function convertToWebP(inputPath) {
    const outputPath = inputPath.replace(path.extname(inputPath), ".webp");
    logger.log(`🔄 Convertendo imagem para WebP (Sticker): ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0",
                "-preset", "default",
                "-an",
                "-vsync", "0"
            ])
            .toFormat("webp")
            .on("end", () => {
                logger.log("✅ Conversão para WebP concluída com sucesso");
                resolve(outputPath);
            })
            .on("error", (err) => {
                logger.error("❌ Erro na conversão para WebP:", err.message);
                reject(err);
            })
            .save(outputPath);
    });
}

/**
 * Converte um vídeo para MP4 (H.264/AAC) compatível com WhatsApp
 * @param {string} inputPath - Caminho do arquivo original
 * @returns {Promise<string>} - Caminho do arquivo .mp4
 */
async function convertToMp4(inputPath) {
    const extension = path.extname(inputPath);
    const outputPath = inputPath.replace(extension, "_conv.mp4");
    logger.log(`🔄 Convertendo vídeo para MP4: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            .outputOptions([
                "-pix_fmt", "yuv420p",
                "-movflags", "faststart",
                "-vf", "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'"
            ])
            .toFormat("mp4")
            .on("end", () => {
                logger.log("✅ Conversão para MP4 concluída com sucesso");
                resolve(outputPath);
            })
            .on("error", (err) => {
                logger.error("❌ Erro na conversão para MP4:", err.message);
                reject(err);
            })
            .save(outputPath);
    });
}

/**
 * Remove um arquivo local com segurança
 * @param {string} filePath - Caminho do arquivo
 */
function cleanupLocal(filePath) {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            logger.log(`🗑️ Arquivo temporário removido: ${path.basename(filePath)}`);
        } catch (error) {
            logger.error(`⚠️ Erro ao remover arquivo temporário: ${error.message}`);
        }
    }
}

/**
 * Obtém o tamanho do arquivo localmente
 * @param {string} filePath 
 * @returns {number} bytes
 */
function getFileSize(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.statSync(filePath).size;
    }
    return 0;
}

module.exports = {
    downloadMedia,
    cleanup: cleanupLocal,
    getFileSize,
    convertToOgg,
    convertToWebP,
    convertToMp4
};
