export function copyText(text) {
  if (typeof navigator === "undefined") return;
  if (typeof document === "undefined") return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch((err) => {
        console.log('Erro ao copiar texto:', err);
        return false;
      });
  } else {
    // Fallback para navegadores mais antigos
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve(success);
    } catch (err) {
      console.log('Erro ao copiar texto (fallback):', err);
      return Promise.resolve(false);
    }
  }
}