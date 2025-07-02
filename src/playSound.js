export default function playSound(sound, extension = "mp3") {
    const audio = new Audio(`/sfx/${sound}.${extension}`);
    audio.play()
}