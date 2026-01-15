const path = require("path");
const logger = require("../../utils/logger");


/**
 * Converte um arquivo de áudio para OGG/Opus (formato nativo do WhatsApp)
 * @param {string} inputPath - Caminho do arquivo original
 * @returns {Promise<string>} - Caminho do novo arquivo .ogg
 */
async function convertToOgg(inputPath) {
    const outputPath = inputPath.replace(path.extname(inputPath), ".ogg");
    logger.log(`🔄 Convertendo áudio para OGG/Opus: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);

    const ffmpeg = require("fluent-ffmpeg");
    const ffmpegPath = require("ffmpeg-static");
    ffmpeg.setFfmpegPath(ffmpegPath);

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

module.exports = { convertToOgg };
