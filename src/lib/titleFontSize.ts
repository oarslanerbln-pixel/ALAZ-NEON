/**
 * Dev 3B başlığın (KineticSpark) yazı boyutu — yalnızca ekran genişliğine
 * DEĞİL, yazının uzunluğuna da bağlı olmak zorunda.
 *
 * Sabit `clamp(3.25rem, 17vw, 18rem)` yalnızca "HENGAME" (7 karakter) için
 * doğruydu. Mekan markalaşması geldikten sonra başlık artık mekanın adını
 * basıyor ve uzun bir ad taşıyordu: tarayıcıda ölçüldü, "HÜRREM SULTAN"
 * (13 karakter) 1920px'lik bir TV'de 2340px yer kaplayıp iki yanından ~420px
 * kırpılıyordu — hem TV'de hem mobilde.
 *
 * Bu fontta metin genişliği ≈ 0,68em × karakter sayısı. Ekranın %92'sine
 * sığdırmak için üst sınır: 92vw / (0,68 × n) ≈ 135vw / n. Kısa adlarda bu
 * değer 17vw'nin üstünde kaldığı için min() 17vw'yi seçiyor, yani davranış
 * eskisiyle birebir aynı; yalnızca uzun adlar küçülüyor. Alt sınır
 * 3.25rem'den 1.75rem'e indi, çünkü eski taban çok uzun adlarda tek başına
 * taşmaya yetiyordu.
 *
 * Bileşenden AYRI bir dosyada duruyor: React bileşeni barındıran bir dosyadan
 * fonksiyon export etmek fast-refresh'i bozuyor (bkz. ToastContextCore.ts,
 * VenueContextCore.ts — aynı ayrımın kurulu örnekleri).
 */
export function titleFontSize(text: string): string {
  const charCount = Math.max(text.length, 1);
  const lengthCapVw = (135 / charCount).toFixed(2);
  return `clamp(1.75rem, min(17vw, ${lengthCapVw}vw), 18rem)`;
}
