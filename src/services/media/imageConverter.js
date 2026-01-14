const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const logger = require("../../utils/logger");

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Converte uma imagem para WebP (formato de sticker do WhatsApp - 512x512)
 * @param {string} inputPath - Caminho do arquivo original
 * @param {Object} options - Opções de redimensionamento
 * @returns {Promise<string>} - Caminho do arquivo .webp
 */
async function convertToWebP(inputPath, options = {}) {
    const { resizeMode = "pad", padColor = "black", blurIntensity = 20 } = options;
    const outputPath = inputPath.replace(path.extname(inputPath), ".webp");
    logger.log(`🔄 Convertendo imagem para WebP (${resizeMode}): ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);

    return new Promise((resolve, reject) => {
        let vf = "";

        switch (resizeMode) {
            case "stretch":
                vf = "scale=512:512";
                break;
            case "cover":
                vf = "scale=512:512:force_original_aspect_ratio=increase,crop=512:512";
                break;
            case "blur":
                const sigma = blurIntensity;
                vf = `split[main][tmp];[tmp]scale=512:512:force_original_aspect_ratio=increase,crop=512:512,boxblur=${sigma}:1[bg];[main]scale=512:512:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;
                break;
            case "transparent":
            case "contain":
                vf = "format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";
                break;
            case "pad":
            default:
                const color = padColor === "transparent" ? "#00000000" : padColor;
                const format = (padColor === "transparent" || resizeMode === "transparent") ? "format=rgba," : "";
                vf = `${format}scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=${color}`;
                break;
        }

        ffmpeg(inputPath)
            .outputOptions([
                "-vcodec", "libwebp",
                "-vf", vf,
                "-preset", "default",
                "-an",
                "-vsync", "0"
            ])
            .toFormat("webp")
            .on("end", () => {
                logger.log(`✅ Conversão para WebP (${resizeMode}) concluída com sucesso`);
                resolve(outputPath);
            })
            .on("error", (err) => {
                logger.error(`❌ Erro na conversão para WebP (${resizeMode}):`, err.message);
                reject(err);
            })
            .save(outputPath);
    });
}

module.exports = { convertToWebP };
