/**
 * Toca um som para o usuário
 * @param {string} sound - Nome do áudio dentro da pasta de efeitos sonoros (@/public/sfx) 
 * @param {Object} settings - Opções a ser consideradas quando for tocar
 * @param {string} [settings.extension=mp3] - Extensão do arquivo na pasta de efeitos sonoros
 * @param {boolean} [settings.bypassPreference=false] - Se o som deve ser forçado mesmo caso o usuário tenha desabilitado nas preferências 
 */
export default function playSound(sound, settings = { extension: "mp3", bypassPreference: false }) {
    if (!settings.bypassPreference) if (localStorage.getItem("preferences.sound_effects_disabled") == "true") return;

    const audio = new Audio(`/sfx/${sound}.${settings.extension}`);
    audio.play()
}

/*
// Pré-carrega os áudios
const audios = {
    'ColorPick.mp3': new Audio(`/sfx/ColorPick.mp3`),
    'CooldownOverAlert.mp3': new Audio(`/sfx/CooldownOverAlert.mp3`),
    'Fail.mp3': new Audio(`/sfx/Fail.mp3`),
    'PixelPlace.mp3': new Audio(`/sfx/PixelPlace.mp3`),
}

export default function playSound(sound, settings = { extension: "mp3", bypassPreference: false }) {
    if (!settings.bypassPreference && localStorage.getItem("preferences.sound_effects_disabled") == "true") return;

    audios[`${sound}.${settings.extension}`].play()
}
*/