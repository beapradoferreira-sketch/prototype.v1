/* CNPJ — formato duplo.
 *
 * Desde julho de 2026 novas inscrições podem receber um CNPJ cuja base de 12
 * caracteres mistura letras e dígitos. Os CNPJs numéricos existentes seguem
 * válidos para sempre, então os dois formatos precisam ser aceitos em todo
 * lugar, desde o primeiro schema.
 *
 * Os dígitos verificadores continuam numéricos e continuam mod-11. A única
 * mudança é quanto cada caractere contribui: seu código ASCII menos 48. Assim
 * '0'-'9' valem 0-9 exatamente como antes, e 'A'-'Z' valem 17-42 — que é o
 * motivo de o algoritmo antigo continuar funcionando para os números antigos.
 */

const BASE_LENGTH = 12;
const FULL_LENGTH = 14;
const WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Remove formatação e normaliza a caixa. Letras sempre em maiúsculas. */
export function normalizeCnpj(input: string): string {
  return input.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

export function isAlphanumericCnpj(input: string): boolean {
  return /[A-Z]/.test(normalizeCnpj(input));
}

/** Valor de um caractere para a soma mod-11: ASCII − 48. */
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

/** Calcula os dois dígitos verificadores de uma base de 12 caracteres. */
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

  // A base pode ser alfanumérica; os dois dígitos verificadores nunca são.
  if (!/^[0-9A-Z]{12}$/.test(base)) return false;
  if (!/^[0-9]{2}$/.test(digits)) return false;

  // Rejeita bases de caractere repetido (00000000000000 e semelhantes).
  if (/^(.)\1{11}$/.test(base)) return false;

  return computeCheckDigits(base) === digits;
}

/** Formata como XX.XXX.XXX/XXXX-NN. Funciona nos dois formatos. */
export function formatCnpj(input: string): string {
  const v = normalizeCnpj(input);
  if (v.length !== FULL_LENGTH) return input;
  return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
}

/** Rótulo para os selos da interface, distinguindo os dois formatos. */
export function cnpjFormatLabel(input: string): "alfanumérico" | "numérico" {
  return isAlphanumericCnpj(input) ? "alfanumérico" : "numérico";
}
