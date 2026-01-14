const fs = require("fs");
const path = require("path");
const { AUTH_DIR } = require("../../config/constants");

/**
 * Retorna estatísticas de uso do volume (arquivos e pastas)
 * Ignora a pasta de autenticação
 */
const getVolumeStats = async (req, res) => {
    try {
        const rootDir = process.cwd();
        const stats = {
            totalSize: 0,
            fileCount: 0,
            structure: []
        };

        function scanDir(directory) {
            const items = fs.readdirSync(directory);
            const folderContent = [];

            for (const item of items) {
                const fullPath = path.join(directory, item);

                // Ignora nodes_modules, .git e a pasta de AUTH
                if (fullPath.includes("node_modules") || fullPath.includes(".git")) continue;
                if (fullPath === path.resolve(AUTH_DIR)) continue;

                try {
                    const fileStat = fs.statSync(fullPath);
                    const isDirectory = fileStat.isDirectory();

                    if (isDirectory) {
                        const children = scanDir(fullPath);
                        folderContent.push({
                            name: item,
                            type: "folder",
                            size: children.reduce((acc, curr) => acc + curr.size, 0), // Tamanho aproximado da pasta
                            children: children
                        });
                    } else {
                        stats.totalSize += fileStat.size;
                        stats.fileCount++;
                        folderContent.push({
                            name: item,
                            type: "file",
                            size: fileStat.size
                        });
                    }
                } catch (err) {
                    // Ignora arquivos que não podem ser lidos (permissão, etc)
                }
            }
            return folderContent;
        }

        stats.structure = scanDir(rootDir);

        // Formata tamanho total
        const formatSize = (bytes) => {
            if (bytes === 0) return "0 B";
            const k = 1024;
            const sizes = ["B", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
        };

        return res.json({
            success: true,
            totalSizeBytes: stats.totalSize,
            totalSizeFormatted: formatSize(stats.totalSize),
            fileCount: stats.fileCount,
            structure: stats.structure
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Erro ao calcular estatísticas do volume",
            details: error.message
        });
    }
};

module.exports = getVolumeStats;
