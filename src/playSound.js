export default function playSound(sound, settings = { extension: "mp3", bypassPreference: false }) {
    if (!settings.bypassPreference) if (localStorage.getItem("preferences.sound_effects_disabled") == "true") return;

    const audio = new Audio(`/sfx/${sound}.${settings.extension}`);
    audio.play()
}