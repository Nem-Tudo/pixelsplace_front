/**
 * Transforma um objeto Date em uma data em string
 * @param {Date} date 
 * @returns String da data no padrão brasileiro (HH:mm DD/MM/AAAA)
 */
export function dateToString(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Transforma uma string de data em um timestamp
 * @param {*} dataStr String da data (Espera um formato como "24/06/25 14:30")
 * @returns Timestamp da data
 */
export function dateToTimestamp(dataStr) {
  // Espera um formato como "24/06/25 14:30"
  const [data, hora] = dataStr.split(" ");
  const [dia, mes, ano] = data.split("/").map(Number);
  const [horaStr, minutoStr] = hora.split(":").map(Number);

  // Adiciona 2000 se o ano tiver só 2 dígitos
  const anoCompleto = ano < 100 ? 2000 + ano : ano;

  const date = new Date(anoCompleto, mes - 1, dia, horaStr, minutoStr);
  return date.getTime(); // ou date.valueOf()
}

/**
 * Formata uma data baseada numa string ISO
 * @param {string} isoString - String ISO da data 
 * @returns Data formatada no estilo brasileiro "HH:mm DD/MM/AAAA"
 */
export function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  // Verifica se é hoje (mesmo dia, mês e ano)
  const isToday = date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Verifica se é do ano atual
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `${hours}:${minutes}`;
  } else if (isCurrentYear) {
    return `${hours}:${minutes} ${day}/${month}`;
  } else {
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }
}