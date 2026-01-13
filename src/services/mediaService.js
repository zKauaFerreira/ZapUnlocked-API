const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { TEMP_DIR } = require("../config/constants");
const logger = require("../utils/logger");

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
        // Primeiro tentamos obter o tamanho do arquivo via HEAD
        let contentLength = 0;
        try {
            const headResponse = await axios.head(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                timeout: 5000
            });
            contentLength = parseInt(headResponse.headers["content-length"] || 0);
        } catch (e) {
            logger.log("⚠️ Falha ao obter Content-Length via HEAD, tentando via GET...");
        }

        if (contentLength > MAX_SIZE) {
            const sizeMB = (contentLength / (1024 * 1024)).toFixed(2);
            throw new Error(`Arquivo muito grande: ${sizeMB}MB. O limite máximo é 400MB.`);
        }

        const response = await axios({
            method: "get",
            url: url,
            responseType: "stream",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "*/*"
            },
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
        if (extension === ".mpeg") extension = ".mp4";
        if (extension === ".ogg") extension = ".opus"; // Para áudios fixos

        const filename = `${crypto.randomUUID()}${extension}`;
        const filePath = path.join(TEMP_DIR, filename);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                const stats = fs.statSync(filePath);
                logger.log(`✅ Download concluído: ${path.basename(filePath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
                resolve(filePath);
            });
            writer.on("error", (err) => {
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
    getFileSize
};
