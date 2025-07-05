let audios = {}; // escopo global, mas vazio até inicializar

// Inicializa os áudios no cliente
export function initSounds() {
    if (typeof window === 'undefined') return; // garante que só roda no browser

    const audioFiles = ['ColorPick', 'CooldownOverAlert', 'Fail', 'PixelPlace'];
    audios = {}; // reseta para garantir

    audioFiles.forEach(name => {
        audios[name] = new Audio(`/sfx/${name}.mp3`);
    });
}

/**
 * Toca um som para o usuário
 * @param {string} sound - Nome do áudio (ex.: 'PixelPlace')
 * @param {Object} settings - Opções ao tocar
 * @param {string} [settings.extension="mp3"] - Extensão do arquivo
 * @param {boolean} [settings.bypassPreference=false] - Ignora preferências
 */
export default function playSound(sound, settings = { extension: "mp3", bypassPreference: false }) {
    if (typeof window === 'undefined') return; // no SSR não faz nada

    if (!settings.bypassPreference && localStorage.getItem("preferences.sound_effects_disabled") === "true") {
        return;
    }

    const audio = audios[sound];
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => console.warn(`Erro ao tocar som ${sound}:`, err));
    } else {
        console.warn(`Som não inicializado: ${sound}`);
    }
}