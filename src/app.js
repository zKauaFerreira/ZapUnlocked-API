const express = require("express");
const routes = require("./routes");
const sendRoutes = require("./routes/send");
const qrRoutes = require("./routes/qr");
const logger = require("./utils/logger");

/**
 * Configuração e inicialização do Express
 */
function createApp() {
  const app = express();

  // Middlewares
  app.use(express.json());

  // Middleware para capturar erros de JSON malformado
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      logger.error("⚠️ Payload JSON malformado recebido:", err.message);
      return res.status(400).json({
        error: "JSON malformado",
        message: "O corpo da requisição contém um erro de sintaxe JSON. Verifique vírgulas e aspas.",
        details: err.message
      });
    }
    next();
  });

  // Rotas
  app.use("/", routes);
  app.use("/", sendRoutes);
  app.use("/qr", qrRoutes);

  return app;
}

module.exports = createApp;
