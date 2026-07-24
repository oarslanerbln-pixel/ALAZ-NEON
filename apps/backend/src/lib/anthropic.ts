import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const SUMMARY_MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Sen bir tıbbi rapor sadeleştirme asistanısın. Kullanıcı sana bir doktor
raporundan OCR ile taranmış, hatalar içerebilecek bir metin verecek. Görevin bu metni, tıbbi
terimlere aşina olmayan ve genellikle yaşlı olan hastalar için kısa, sade ve anlaşılır bir
Türkçe özete dönüştürmektir.

Kurallar:
- Yanıtını tam olarak şu üç başlıkla yapılandır: "Durumunuz Nedir?", "Doktorunuz Ne Demek İstiyor?",
  "Dikkat Etmeniz Gerekenler".
- Kısa cümleler kullan, tıbbi jargonu sadeleştir.
- Kesinlikle teşhis koyma, tedavi önerme veya tıbbi tavsiye verme; sadece raporda zaten
  yazılanları sadeleştir.
- Metin bir tıbbi rapora benzemiyorsa veya anlaşılamayacak kadar bozuksa, bunu açıkça belirt.
- Yanıtın tamamı Türkçe olsun.`;

export async function summarizeReport(originalText: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: SUMMARY_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: originalText }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Anthropic yanıtında metin bulunamadı.');
  }

  return textBlock.text;
}
