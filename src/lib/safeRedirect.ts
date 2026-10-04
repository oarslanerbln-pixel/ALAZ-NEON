/**
 * Giriş sonrası dönülecek yolu (`/login?next=...`) güvenli hâle getirir.
 *
 * Yalnızca aynı uygulama içindeki mutlak yollar kabul edilir. `//evil.com`
 * ve `/\evil.com` tarayıcıda başka bir siteye giden yollar (açık
 * yönlendirme): personel giriş formu taklit edilen bir sayfaya
 * yönlendirilebilirdi.
 */
export function safeNextPath(raw: string | null | undefined, fallback: string): string {
  if (!raw || !raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
