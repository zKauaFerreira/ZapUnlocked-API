/**
 * Formata texto substituindo placeholders de data/hora
 * Ex: {{day/mon/yea - hou:min}} -> 14/01/2026 - 16:30
 * 
 * Placeholders suportados:
 * {{day}} - Dia com 2 dígitos
 * {{mon}} - Mês com 2 dígitos
 * {{yea}} - Ano com 4 dígitos
 * {{hou}} - Hora com 2 dígitos
 * {{min}} - Minuto com 2 dígitos
 * {{sec}} - Segundo com 2 dígitos
 */
function formatText(text) {
    if (!text || typeof text !== 'string') return text;

    const now = new Date();

    // Mapa de substituição
    const map = {
        "day": String(now.getDate()).padStart(2, "0"),
        "mon": String(now.getMonth() + 1).padStart(2, "0"),
        "yea": String(now.getFullYear()),
        "hou": String(now.getHours()).padStart(2, "0"),
        "min": String(now.getMinutes()).padStart(2, "0"),
        "sec": String(now.getSeconds()).padStart(2, "0")
    };

    // Regex para capturar conteúdo dentro de {{...}} e substituir chaves conhecidas
    // A regex /{{(.*?)}}/g busca qualquer coisa entre {{ e }}
    return text.replace(/{{(.*?)}}/g, (match, content) => {
        let result = content;
        let hasReplacement = false;

        // Substitui cada palavra chave conhecida mantendo os separadores
        Object.keys(map).forEach(key => {
            const regex = new RegExp(key, "g");
            if (result.includes(key)) {
                result = result.replace(regex, map[key]);
                hasReplacement = true;
            }
        });

        // Se não houve nenhuma substituição de chave conhecida, retorna o match original (ex: {{custom}})
        // Mas se o usuário quis usar {{day/mon}}, result será "14/01", então retornamos result.
        return hasReplacement ? result : match;
    });
}

module.exports = { formatText };
