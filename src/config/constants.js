const path = require("path");
const fs = require("fs");

// Usa variável de ambiente ou caminho padrão
// Na Railway, configure AUTH_DIR para um volume persistente
// Exemplo: AUTH_DIR=/data/auth_info
const defaultAuthDir = path.join(__dirname, "..", "..", "auth_info");
const authDir = process.env.AUTH_DIR || defaultAuthDir;

// Garante que o diretório existe e loga para debug
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}
console.log(`📁 Diretório de autenticação: ${path.resolve(authDir)}`);

module.exports = {
  PORT: process.env.PORT || 3000,
  API_KEY: process.env.API_KEY,
  INTERNAL_SECRET: process.env.INTERNAL_SECRET || (() => {
    console.warn("⚠️ AVISO: INTERNAL_SECRET não definida. Usando valor padrão (NÃO RECOMENDADO EM PRODUÇÃO).");
    return "zap-unlocked-secret-default-change-me-danger";
  })(),
  AUTH_DIR: authDir,
  WHATSAPP_CONFIG: {
    browser: ["Spotify Payments", "Opera GX", "120.0.5543.204"],
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    syncFullHistory: false,
    syncFullHistoryLimit: 0,
    shouldSyncHistoryMessage: () => false
  },
  RECONNECT_DELAY: 5000
};
