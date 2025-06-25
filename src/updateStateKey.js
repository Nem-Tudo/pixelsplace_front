export default function updateStateKey(setState, state, ...changes) {
  const newState = { ...state };
  
  changes.forEach(([keyPath, newValue]) => {
    const keys = keyPath.split('.');
    let current = newState;
    
    // Navega até o penúltimo nível, criando objetos se necessário
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }
      current = current[key];
    }
    
    // Define o valor final
    const finalKey = keys[keys.length - 1];
    current[finalKey] = newValue;
  });
  
  setState(newState);
}