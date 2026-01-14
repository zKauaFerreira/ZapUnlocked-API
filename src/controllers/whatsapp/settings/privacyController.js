const { getSock } = require("../../../services/whatsapp/client");
const logger = require("../../../utils/logger");
const { formatText } = require("../../../utils/formatter");

exports.updatePrivacy = async (req, res) => {
    try {
        const sock = getSock();
        if (!sock) return res.status(503).json({ error: "WhatsApp não conectado" });

        const {
            lastSeen,
            online,
            profilePicture,
            status, // Privacidade do status (stories)
            readReceipts,
            groupsAdd,
            defaultDisappearingMode,
            about // Texto do recado/status do perfil
        } = req.body;

        const updates = [];
        let updatedCount = 0;

        // --- Configurações de Privacidade ---

        if (lastSeen) {
            await sock.updateLastSeenPrivacy(lastSeen);
            updates.push(`Visto por último: ${lastSeen}`);
            updatedCount++;
        }

        if (online) {
            await sock.updateOnlinePrivacy(online);
            updates.push(`Online: ${online}`);
            updatedCount++;
        }

        if (profilePicture) {
            await sock.updateProfilePicturePrivacy(profilePicture);
            updates.push(`Foto de Perfil: ${profilePicture}`);
            updatedCount++;
        }

        if (status) {
            await sock.updateStatusPrivacy(status);
            updates.push(`Privacidade Status: ${status}`);
            updatedCount++;
        }

        if (readReceipts) {
            await sock.updateReadReceiptsPrivacy(readReceipts);
            updates.push(`Confirmação de Leitura: ${readReceipts}`);
            updatedCount++;
        }

        if (groupsAdd) {
            await sock.updateGroupsAddPrivacy(groupsAdd);
            updates.push(`Adição em Grupos: ${groupsAdd}`);
            updatedCount++;
        }

        if (defaultDisappearingMode !== undefined) {
            await sock.updateDefaultDisappearingMode(defaultDisappearingMode);
            updates.push(`Mensagens Temporárias: ${defaultDisappearingMode}s`);
            updatedCount++;
        }

        // --- Atualização de Perfil (About) ---

        if (about) {
            const formattedAbout = formatText(about);
            await sock.updateProfileStatus(formattedAbout);
            updates.push(`Recado/About alterado para: "${formattedAbout}"`);
            updatedCount++;
        }

        if (updatedCount === 0) {
            return res.status(400).json({
                error: "Nenhum parâmetro fornecido. Envie pelo menos um campo para atualizar."
            });
        }

        logger.log(`⚙️ Configurações de privacidade atualizadas: ${updates.join(", ")}`);

        res.json({
            success: true,
            updated: updates
        });

    } catch (err) {
        logger.error("Erro ao atualizar privacidade", err.message);
        res.status(500).json({ error: err.message });
    }
};
