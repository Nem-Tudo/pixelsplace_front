import { readdirSync } from 'fs';

export default function SoundEngine() {
  const audioRefs = {};

  function load() {
    if (typeof window === 'undefined') return; // SSR protection

    try {
      const files = readdirSync('/sfx');
      for (const file in files) {
        if(!audioRefs[file]) return;
        const audio = new Audio(`/sfx/${file}`);
        audio.load();
        audioRefs[file] = audio;
      }
    } catch (err) {
      console.warn(err);
    }
  }

  function play(file) {
    if (typeof window === 'undefined') return; // SSR protection
    
    const audio = audioRefs[file];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.error(`Erro ao tocar ${file}:`, err);
      });
    } else {
      console.warn(`Áudio ${file} não carregado.`);
    }
  }

  return {
    load,
    play,
  };
}