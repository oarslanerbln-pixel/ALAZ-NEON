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

export type MedicationCandidate = {
  name: string;
  dosage: string;
  timeOfDay: string;
};

const TIME_OF_DAY_VALUES = ['Sabah', 'Öğle', 'Akşam', 'Gece'] as const;

const EXTRACT_SYSTEM_PROMPT = `Sen bir tıbbi rapor/reçete metninden bahsedilen ilaçları çıkaran bir asistansın.
Metinde açıkça adı geçen ilaçları listele. Emin olmadığın, tahmin gerektiren hiçbir ilacı ekleme.
Metinde hiç ilaç adı geçmiyorsa boş bir liste döndür. Yeni ilaç uydurma, sadece metinde yazılanı çıkar.`;

export async function extractMedicationCandidates(originalText: string): Promise<MedicationCandidate[]> {
  const message = await getClient().messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: EXTRACT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: originalText }],
    tools: [
      {
        name: 'record_medications',
        description: 'Rapor metninde açıkça geçen ilaçları kaydet.',
        input_schema: {
          type: 'object',
          properties: {
            medications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'İlacın adı (raporda yazıldığı gibi)' },
                  dosage: { type: 'string', description: 'Doz bilgisi, örn. "1 tablet" veya "500mg"' },
                  timeOfDay: { type: 'string', enum: [...TIME_OF_DAY_VALUES], description: 'Kullanım zamanı, belirsizse Sabah' },
                },
                required: ['name', 'dosage', 'timeOfDay'],
              },
            },
          },
          required: ['medications'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'record_medications' },
  });

  const toolUse = message.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    return [];
  }

  const input = toolUse.input as { medications?: MedicationCandidate[] };
  return input.medications ?? [];
}
