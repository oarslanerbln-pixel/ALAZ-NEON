import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  migrations: {
    schemaPath: './prisma/schema.prisma',
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medisade',
  },
});
