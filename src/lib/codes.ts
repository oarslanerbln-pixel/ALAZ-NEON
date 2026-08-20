// Karışıklık yaratabilecek karakterler (0/O, 1/I) bilerek dışarıda —
// hem oda kodları hem ödül kodları elle okunup barda/kapıda söylenecek.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** `length` haneli rastgele bir kod üretir (oda kodu, ödül kodu vb. için ortak). */
export function generateCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
  }
  return code;
}
