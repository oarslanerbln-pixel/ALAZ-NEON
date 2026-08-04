import { vi } from 'vitest';

export const prisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  medication: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
