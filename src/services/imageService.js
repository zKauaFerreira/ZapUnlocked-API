const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { TEMP_DIR } = require("../config/constants");
const logger = require("../utils/logger");

/**
 * Serviço para download e limpeza de imagens temporárias
 */

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

/**
 * Faz download de uma imagem de uma URL
 * @param {string} url - URL da imagem
 * @returns {Promise<string>} - Caminho local do arquivo salvo
 */
async function downloadImage(url) {
    try {
        const response = await axios({
            method: "get",
            url: url,
            responseType: "stream",
            timeout: 30000 // 30 segundos
        });

        const contentLength = response.headers["content-length"];
        if (contentLength && parseInt(contentLength) > MAX_SIZE) {
            throw new Error("Imagem excede o limite de 20MB");
        }

        const filename = `${crypto.randomUUID()}.jpg`;
        const filePath = path.join(TEMP_DIR, filename);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => resolve(filePath));
            writer.on("error", (err) => {
                cleanupLocal(filePath);
                reject(err);
            });
        });
    } catch (error) {
        logger.error("❌ Erro ao baixar imagem:", error.message);
        throw error;
    }
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

module.exports = {
    downloadImage,
    cleanup: cleanupLocal
};
