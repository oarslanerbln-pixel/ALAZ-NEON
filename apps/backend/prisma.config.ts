import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  studio: {
    port: 5555,
  },
  migrations: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medisade',
  },
});
