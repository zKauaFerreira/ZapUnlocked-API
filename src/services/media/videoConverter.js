const path = require("path");
const logger = require("../../utils/logger");


/**
 * Converte um vídeo para MP4 (H.264/AAC) compatível com WhatsApp
 * @param {string} inputPath - Caminho do arquivo original
 * @returns {Promise<string>} - Caminho do arquivo .mp4
 */
async function convertToMp4(inputPath) {
    const extension = path.extname(inputPath);
    const outputPath = inputPath.replace(extension, "_conv.mp4");
    logger.log(`🔄 Convertendo vídeo para MP4: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);

    const ffmpeg = require("fluent-ffmpeg");
    const ffmpegPath = require("ffmpeg-static");
    ffmpeg.setFfmpegPath(ffmpegPath);

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

module.exports = { convertToMp4 };
