import cron from 'node-cron';
import { prisma } from './prisma.js';
import { sendPushToUser } from './push.js';

const TIME_OF_DAY_SCHEDULE: Record<string, string> = {
  Sabah: '0 8 * * *',
  Öğle: '0 13 * * *',
  Akşam: '0 19 * * *',
  Gece: '0 22 * * *',
};

async function remindForTimeOfDay(timeOfDay: string) {
  const medications = await prisma.medication.findMany({ where: { timeOfDay } });

  const byUser = new Map<string, typeof medications>();
  for (const med of medications) {
    const list = byUser.get(med.userId) ?? [];
    list.push(med);
    byUser.set(med.userId, list);
  }

  await Promise.all(
    Array.from(byUser.entries()).map(([userId, meds]) => {
      const body = meds.map((m) => `${m.name} (${m.dosage})`).join(', ');
      return sendPushToUser(userId, { title: `${timeOfDay} ilaç zamanı`, body }).catch(() => {});
    })
  );
}

export function startReminderScheduler() {
  if (!process.env.VAPID_PUBLIC_KEY) {
    console.log('VAPID anahtarları tanımlı değil, hatırlatıcı zamanlayıcı başlatılmadı.');
    return;
  }

  for (const [timeOfDay, expression] of Object.entries(TIME_OF_DAY_SCHEDULE)) {
    cron.schedule(expression, () => remindForTimeOfDay(timeOfDay), { timezone: 'Europe/Istanbul' });
  }
  console.log('Hatırlatıcı zamanlayıcı başlatıldı.');
}
