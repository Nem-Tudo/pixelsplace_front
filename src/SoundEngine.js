import { useEffect, useState } from "react";

const SoundEngine = (function () {
  const audioRefs = {};

  function load(files = []) {
    files.forEach((file) => {
      if (!audioRefs[file]) {
        const [audio, setAudio] = useState(null)
        useEffect(() => {
          setAudio(new Audio(`/sfx/${file}`))
          audio.load();
          audioRefs[file] = audio;
        }, [])
      }
    });
  }

  function play(file) {
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
})();

export default SoundEngine;