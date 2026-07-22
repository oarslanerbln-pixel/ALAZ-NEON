import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Sen bir sağlık raporunu hastanın anlayabileceği şekilde özetleyen bir asistansın.
OCR ile taranmış bir tıbbi rapor/reçete metni verilecek. Şunları üret:
1. Durumunuz Nedir? (basit, tıbbi jargonsuz özet)
2. Doktorunuz Ne Demek İstiyor? (tanı/bulgular sade dilde)
3. Dikkat Etmeniz Gerekenler (ilaç kullanımı, kontrol tarihi, uyarılar)

Kısa, net, Türkçe yaz. Tıbbi tavsiye verme, sadece raporu sadeleştir.`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY tanımlı değil. apps/backend/.env dosyasına ekleyin.');
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function summarizeReport(originalText: string): Promise<string> {
  const message = await getClient().messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: originalText }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Özetleme yanıtı beklenmeyen formatta döndü.');
  }
  return textBlock.text;
}
