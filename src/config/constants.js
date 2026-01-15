const path = require("path");
const fs = require("fs");

// Usa variável de ambiente ou caminho padrão
// Na Railway, configure AUTH_DIR para um volume persistente
// Exemplo: AUTH_DIR=/data/auth_info
const defaultAuthDir = path.join(__dirname, "..", "..", "auth_info");

// Detecção automática de volume persistente (Railway/Docker)
// Se existir a pasta /data na raiz (Linux), usamos ela para garantir persistência.
// Caso contrário (Windows/Local), usamos a pasta local ./data
const systemVolumePath = "/data";
const hasSystemVolume = process.platform !== "win32" && fs.existsSync(systemVolumePath);

const defaultDataDir = hasSystemVolume ? systemVolumePath : path.join(process.cwd(), "data");
const dataDir = process.env.DATA_DIR || defaultDataDir;

// Se o AUTH_DIR não estiver definido via env, e tivermos volume, tentamos alinhar
const authDir = process.env.AUTH_DIR || (hasSystemVolume ? path.join(systemVolumePath, "auth_info") : defaultAuthDir);
const tempDir = path.join(__dirname, "..", "..", "temp_media");

// Garante que os diretórios existem
if (!fs.existsSync(authDir)) {
  try { fs.mkdirSync(authDir, { recursive: true }); } catch (e) { console.error("Erro ao criar AUTH_DIR:", e.message); }
}
if (!fs.existsSync(dataDir)) {
  try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) { console.error("Erro ao criar DATA_DIR:", e.message); }
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log(`📁 Diretório de autenticação: ${authDir}`);
console.log(`📁 Diretório de dados (chats): ${dataDir}`);

module.exports = {
  PORT: process.env.PORT || 3000,
  API_KEY: process.env.API_KEY,
  INTERNAL_SECRET: process.env.INTERNAL_SECRET,
  AUTH_DIR: authDir,
  DATA_DIR: dataDir, // Exporta o diretório de dados oficial
  TEMP_DIR: tempDir,
  WHATSAPP_CONFIG: {
    browser: ["ZapUnlocked", "Chrome", "20.0.04"],
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false, // Otimização de memória
    markOnlineOnConnect: true,
    syncFullHistory: false,
    syncFullHistoryLimit: 0, // Não sincroniza nada
    shouldSyncHistoryMessage: () => false, // Desativa sync de histórico
    cachedGroupMetadata: false, // Reduz uso de RAM ignorando cache de grupos
    recvBatchMsg: false, // Processa mensagens uma a uma para não sobrecarregar
    shouldIgnoreJid: (jid) => jid.includes("@broadcast") // Ignora status e listas de transmissão
  },
  RECONNECT_DELAY: 5000
};
