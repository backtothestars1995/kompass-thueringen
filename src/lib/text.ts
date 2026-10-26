/** Geschützte Leerzeichen, damit „€“ und Einheiten nicht allein umbrechen */
export function geschuetzt(text: string): string {
  return text.replace(/ (€|EW)\b/g, ' $1').replace(/ €/g, ' €');
}
