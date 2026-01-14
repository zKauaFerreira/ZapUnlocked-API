const express = require("express");
const router = express.Router();
const privacyController = require("../controllers/whatsapp/settings/privacyController");
const blockController = require("../controllers/whatsapp/contacts/blockController");
const { auth } = require("../middleware/auth");

router.use(auth);

// Configurações de Privacidade e Perfil
router.post("/privacy", privacyController.updatePrivacy);

// Bloqueio de Usuários (agrupado em settings ou contacts, definindo aqui como /settings/block)
router.post("/block", blockController.blockUser);

module.exports = router;
