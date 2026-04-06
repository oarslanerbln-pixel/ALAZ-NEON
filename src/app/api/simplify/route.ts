import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build', // Fallback for build time only
});

export async function POST(req: Request) {
  try {
    const { text, language = 'tr' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Metin gerekli' }, { status: 400 });
    }

    let languagePrompt = '';
    if (language === 'en') {
      languagePrompt = 'Translate the output strictly to English.';
    } else if (language === 'ar') {
      languagePrompt = 'Translate the output strictly to Arabic.';
    } else {
      languagePrompt = 'Lütfen Türkçe yanıt verin.';
    }

    const systemPrompt = `Sen bir sağlık bilişimi asistanısın. Görevin karmaşık tıbbi raporları sağlık okuryazarlığı çok düşük, örneğin 70 yaşındaki bir insanın bile kolayca anlayabileceği sadelikte özetlemektir. Asla tıbbi tavsiye verme.

Verilen tıbbi metni şu 3 ana başlık altında ve çok basit bir dille özetle:
1. Durumunuz Nedir?
2. Doktorunuz Ne Demek İstiyor?
3. Dikkat Etmeniz Gerekenler.

${languagePrompt}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Maliyet etkin ve hızlı
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.3, // Daha tutarlı yanıtlar için düşük temperature
    });

    return NextResponse.json({ result: completion.choices[0].message.content });

  } catch (error) {
    console.error('LLM Error:', error);
    return NextResponse.json({ error: 'Özetleme işlemi sırasında bir hata oluştu.' }, { status: 500 });
  }
}
