import AnthropicModule from '@anthropic-ai/sdk';

// Same Vercel-build-only CJS/ESM interop gap as helmet's in app.ts — see the
// comment there. Not reproducible with local tsc.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Anthropic = (AnthropicModule as any).default || AnthropicModule;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Haiku 4.5: short input/output, high volume, cost-sensitive plain-language
// simplification — the right tier for this job (see roadmap notes).
const MODEL = 'claude-haiku-4-5';

const SYSTEM_PROMPT = `Sen MediSade uygulamasının bir parçasısın. Kullanıcılar OCR ile taranmış
tıbbi rapor metinlerini sana gönderiyor. Görevin, bu metni Türkçe ve sade bir dille açıklamak —
tıbbi terimleri günlük dile çevirmek, raporun ne söylediğini anlaşılır kılmak.

Kurallar:
- SADECE verilen metinde yazanları sadeleştir. Metinde olmayan hiçbir tıbbi bilgi, teşhis,
  tedavi önerisi veya yorum EKLEME.
- Asla tıbbi tavsiye verme, ilaç önerme, "şunu yapmalısınız" gibi talimatlar verme.
- Metin OCR ile tarandığı için bozuk veya eksik olabilir; anlamlandıramadığın kısımları
  atlama — "bu kısım net okunamadı" gibi belirt.
- Kısa, sakin ve güven verici bir ton kullan. Panik yaratma.
- Yanıtının sonunda kısaca hatırlat: bu bir tıbbi tavsiye değildir, sonuçlar hakkında
  mutlaka doktoruna danışmalı.
- Yanıtı düz metin olarak ver, markdown başlığı/liste süslemesi kullanma.`;

/**
 * Sends raw OCR text to Claude and returns a plain-language Turkish simplification.
 * Throws on any API/network failure — callers should catch and translate to an
 * HTTP error rather than let this bubble to the generic error middleware, so the
 * user gets a specific "özetleme başarısız" message instead of a bare 500.
 */
export async function summarizeReport(originalText: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: originalText }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see Anthropic interop note above
  const textBlock = message.content.find((block: any) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Beklenmeyen yanıt formatı: metin bloğu bulunamadı.');
  }

  return textBlock.text.trim();
}
