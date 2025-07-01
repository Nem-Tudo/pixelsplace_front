const SoundEngine = (function () {
  const audioRefs = {};

  function load(files = []) {
    if (typeof window === 'undefined') return; // SSR protection
    
    files.forEach((file) => {
      if (!audioRefs[file]) {
        const audio = new Audio(`/sfx/${file}`);
        audio.load();
        audioRefs[file] = audio;
      }
    });
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
})();

export default SoundEngine;