/* CNPJ — dual format.
 *
 * Since July 2026 new registrations can receive a CNPJ whose 12-character base
 * mixes letters and digits. Existing all-numeric CNPJs stay valid forever, so
 * both formats have to be accepted everywhere, from the first schema onward.
 *
 * The check digits are still numeric and still mod-11. The only change is how a
 * character contributes: its ASCII code minus 48. That makes '0'-'9' worth 0-9
 * exactly as before, and 'A'-'Z' worth 17-42 — which is why the legacy
 * algorithm keeps working unchanged for legacy numbers.
 */

const BASE_LENGTH = 12;
const FULL_LENGTH = 14;
const WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Strip formatting and normalise case. Letters are always uppercase. */
export function normalizeCnpj(input: string): string {
  return input.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

export function isAlphanumericCnpj(input: string): boolean {
  return /[A-Z]/.test(normalizeCnpj(input));
}

/** Value of one character for the mod-11 sum: ASCII − 48. */
function charValue(ch: string): number {
  return ch.charCodeAt(0) - 48;
}

function checkDigit(chars: string): number {
  const weights = WEIGHTS.slice(WEIGHTS.length - chars.length);
  let sum = 0;
  for (let i = 0; i < chars.length; i++) {
    sum += charValue(chars[i]) * weights[i];
  }
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/** Compute both check digits for a 12-character base. */
export function computeCheckDigits(base: string): string {
  const b = normalizeCnpj(base);
  if (b.length !== BASE_LENGTH) {
    throw new Error(`CNPJ base must be ${BASE_LENGTH} characters, got ${b.length}`);
  }
  const first = checkDigit(b);
  const second = checkDigit(b + String(first));
  return `${first}${second}`;
}

export function isValidCnpj(input: string): boolean {
  const value = normalizeCnpj(input);
  if (value.length !== FULL_LENGTH) return false;

  const base = value.slice(0, BASE_LENGTH);
  const digits = value.slice(BASE_LENGTH);

  // Base may be alphanumeric; the two check digits never are.
  if (!/^[0-9A-Z]{12}$/.test(base)) return false;
  if (!/^[0-9]{2}$/.test(digits)) return false;

  // Reject repeated-character bases (00000000000000 and friends).
  if (/^(.)\1{11}$/.test(base)) return false;

  return computeCheckDigits(base) === digits;
}

/** Format as XX.XXX.XXX/XXXX-NN. Works for both formats. */
export function formatCnpj(input: string): string {
  const v = normalizeCnpj(input);
  if (v.length !== FULL_LENGTH) return input;
  return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
}

/** Label for UI badges, so the two formats are visibly distinguished. */
export function cnpjFormatLabel(input: string): "alfanumérico" | "numérico" {
  return isAlphanumericCnpj(input) ? "alfanumérico" : "numérico";
}
