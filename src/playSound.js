// Pré-carrega os áudios
const audioFiles = ['ColorPick', 'CooldownOverAlert', 'Fail', 'PixelPlace'];
const audios = {};

audioFiles.forEach(name => {
    audios[`${name}.mp3`] = new Audio(`/sfx/${name}.mp3`);
});

/**
 * Toca um som para o usuário
 * @param {string} sound - Nome do áudio dentro da pasta de efeitos sonoros (@/public/sfx) 
 * @param {Object} settings - Opções a ser consideradas quando for tocar
 * @param {string} [settings.extension=mp3] - Extensão do arquivo na pasta de efeitos sonoros
 * @param {boolean} [settings.bypassPreference=false] - Se o som deve ser forçado mesmo caso o usuário tenha desabilitado nas preferências 
 */
export default function playSound(sound, settings = { extension: "mp3", bypassPreference: false }) {
    if (!settings.bypassPreference && localStorage.getItem("preferences.sound_effects_disabled") == "true") return;

    const key = `${sound}.${settings.extension}`;
    const audio = audios[key];

    if (audio) {
        audio.currentTime = 0; // opcional: reinicia o som se já estiver tocando
        audio.play();
    } else {
        console.warn(`Som não pré-carregado: ${key}`);
    }
}
