import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-mvp';

async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// İlaçları Getir (Decrypt ederek)
export async function GET() {
  try {
    const userId = await getUserFromSession();
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const medications = await prisma.medication.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    const decryptedMedications = medications.map(med => ({
      id: med.id,
      name: decrypt(med.nameEncrypted),
      dosage: med.dosageEncrypted ? decrypt(med.dosageEncrypted) : '',
      time: med.timeEncrypted ? decrypt(med.timeEncrypted) : '',
      isTaken: med.isTaken
    }));

    return NextResponse.json(decryptedMedications);
  } catch (error) {
    console.error('Fetch meds error:', error);
    return NextResponse.json({ error: 'İlaçlar getirilirken hata oluştu.' }, { status: 500 });
  }
}

// Yeni İlaç Ekle (Encrypt ederek)
export async function POST(req: Request) {
  try {
    const userId = await getUserFromSession();
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { name, dosage, time } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'İlaç adı zorunludur' }, { status: 400 });
    }

    const newMedication = await prisma.medication.create({
      data: {
        userId,
        nameEncrypted: encrypt(name),
        dosageEncrypted: dosage ? encrypt(dosage) : null,
        timeEncrypted: time ? encrypt(time) : null,
        isTaken: false
      }
    });

    return NextResponse.json({ success: true, id: newMedication.id });
  } catch (error) {
    console.error('Add med error:', error);
    return NextResponse.json({ error: 'İlaç eklenirken hata oluştu.' }, { status: 500 });
  }
}

// İlaç Durumunu Güncelle (Alındı / Bekliyor)
export async function PATCH(req: Request) {
  try {
    const userId = await getUserFromSession();
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id, isTaken } = await req.json();

    // Sadece kullanıcının kendi ilacını güncellediğinden emin ol
    const existingMed = await prisma.medication.findUnique({ where: { id } });
    if (!existingMed || existingMed.userId !== userId) {
      return NextResponse.json({ error: 'İlaç bulunamadı' }, { status: 404 });
    }

    await prisma.medication.update({
      where: { id },
      data: { isTaken }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update med error:', error);
    return NextResponse.json({ error: 'Durum güncellenirken hata oluştu.' }, { status: 500 });
  }
}
