/* eslint-disable @typescript-eslint/no-require-imports */
import type { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const fallbackDbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const normalizedPath = fallbackDbPath.replace(/\\/g, '/')
const defaultDatasourceUrl = `file:${normalizedPath}`
const resolveDatasourceUrl = (url: string | undefined) => {
  if (!url || !url.startsWith('file:')) {
    return defaultDatasourceUrl
  }
  return url
}

const datasourceUrl = resolveDatasourceUrl(process.env.DATABASE_URL)
process.env.DATABASE_URL = datasourceUrl

const { PrismaClient: PrismaClientFactory } = require('@prisma/client') as typeof import('@prisma/client')

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClientFactory({
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
