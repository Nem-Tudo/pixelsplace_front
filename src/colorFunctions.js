// Função para escurecer cores hexadecimais
export function darkenHex(hex, amount = 20) {
  // Remove o # se presente
  hex = hex.replace('#', '');

  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Escurece cada componente
  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);

  // Converte de volta para hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// Vaca funções
export function hexToNumber(hex) {
  return parseInt(hex.replace("#", ""), 16);
}
export function numberToHex(num = 0) {
  return "#" + num.toString(16).padStart(6, "0");
}

export function getBrightness(hexColor) {
  if(!hexColor) return 0 
  // Remove o # se houver
  hexColor = hexColor.replace(/^#/, '');

  // Expande formato curto (#abc → #aabbcc)
  if (hexColor.length === 3) {
    hexColor = hexColor.split('').map(c => c + c).join('');
  }

  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);

  // Fórmula de luminância relativa (perceptiva)
  const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return brightness;
}