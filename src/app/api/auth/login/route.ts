import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-mvp';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi giriniz.' }, { status: 400 });
    }

    // Kullanıcıyı bul veya oluştur
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    // Magic Link için Token oluştur (1 saat geçerli)
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Gerçek bir senaryoda bu link e-posta ile gönderilir.
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

    console.log('\n======================================================');
    console.log('MAGIC LINK OLUŞTURULDU (SİMÜLASYON):');
    console.log(`E-Posta Gönderilen Adres: ${email}`);
    console.log(`Giriş Yapmak İçin Tıklayın: ${magicLink}`);
    console.log('======================================================\n');

    return NextResponse.json({ message: 'Giriş bağlantısı e-posta adresinize gönderildi.' });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Giriş işlemi sırasında bir hata oluştu.' }, { status: 500 });
  }
}
