import { PrismaClient } from '@prisma/client'

// Instantiate PrismaClient directly with the datasource URL since it is not supported in schema.prisma for newer versions
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL as string,
})

export default prisma
