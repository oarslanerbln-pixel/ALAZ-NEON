/**
 * Bir sayının ardına gelecek Türkçe iyelik ekini (3. tekil) seçer:
 * "%78'i", "%60'ı", "%50'si", "%100'ü".
 *
 * Ek, sayının OKUNUŞUNUN son kelimesine göre ünlü uyumuna giriyor
 * (yetmiş seki*z* → i, altmı*ş* → ı, ell*i* → si). Sabit bir "'i" yazmak
 * ekranın yarısında yanlış Türkçe demekti.
 */
const ONES = ["", "i", "si", "ü", "ü", "i", "sı", "si", "i", "u"]; // bir…dokuz
const TENS = ["ı", "u", "si", "u", "ı", "si", "ı", "i", "i", "ı"]; // sıfır, on…doksan

export function trPossessiveSuffix(value: number): string {
  const n = Math.abs(value);
  if (!Number.isInteger(n)) {
    // "3,7" → "üç virgül yedi": son kelime ondalık kısmın okunuşu.
    const fraction = Number(String(n).split(".")[1]);
    return trPossessiveSuffix(fraction);
  }
  if (n % 1000 === 0 && n > 0) return "i"; // bin
  if (n % 100 === 0 && n > 0) return "ü"; // yüz
  const last2 = n % 100;
  const ones = last2 % 10;
  return ones !== 0 ? ONES[ones] : TENS[last2 / 10];
}
