import { prisma } from './prisma.js';

const DEMO_USER_EMAIL = 'demo@medisade.local';

let demoUserId: string | null = null;

// Placeholder until real authentication is implemented: all requests act as this single demo user.
export async function getDemoUserId(): Promise<string> {
  if (demoUserId) return demoUserId;

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: { email: DEMO_USER_EMAIL },
  });

  demoUserId = user.id;
  return demoUserId;
}
