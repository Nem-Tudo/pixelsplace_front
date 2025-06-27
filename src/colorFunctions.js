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
}

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

export function hexToHsl(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
      h = s = 0; // achromatic
    }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
  return {
    h, s, l
  };
}

export function hexToCssHsl(hex, valuesOnly = false) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(result[1], 16);
  var g = parseInt(result[2], 16);
  var b = parseInt(result[3], 16);
  var cssString = '';
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  cssString = h + ',' + s + '%,' + l + '%';
  cssString = !valuesOnly ? 'hsl(' + cssString + ')' : cssString;
  
  return cssString;
}