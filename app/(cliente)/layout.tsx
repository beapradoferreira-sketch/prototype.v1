/* Área do cliente — chrome próprio, de propósito.
 *
 * Sem menu interno, sem competência do escritório, sem troca de papel. A
 * fronteira precisa ser óbvia a olho nu: se esta área usasse o mesmo shell das
 * telas internas, uma navegação distraída levaria alguém de dentro para fora e
 * um cliente para onde ele não deve ir.
 */

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg">{children}</div>;
}
