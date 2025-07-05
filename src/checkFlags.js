/**
 * Verifica se o grupo de flags contém a flag
 * @param {[]} flags - Conjunto de todas as flags
 * @param {string} flag - Flag específica a ser buscada
 * @param {Object} [settings] - Objeto de configurações do resultado
 * @param {boolean} [settings.positive] - A verificação ser positiva deve retornar true?
 */
export default function checkFlags(flags = [], flag, settings = { positive: true }) {
    if (settings.positive === true) {
        if (flags.includes("ADMIN")) return true;
    } else {
        if (flags.includes("ADMIN")) return false;
    }

    if (flags.includes(flag)) return true;
    return false;
}