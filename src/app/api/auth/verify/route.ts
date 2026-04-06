import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-mvp';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=Token bulunamadı', req.url));
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };

    // Session Cookie oluştur (7 gün geçerli)
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Başarıyla giriş yapıldı, ana sayfaya yönlendir
    return NextResponse.redirect(new URL('/', req.url));

  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.redirect(new URL('/login?error=Bağlantının süresi dolmuş veya geçersiz.', req.url));
  }
}
