import { db } from '@/utils/prisma'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const snapshotRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        month: z.string(),
        year: z.string(),
        type: z.enum(['inventory'])
      })
    )
    .query(
      async ({ input: { month, year, type } }) =>
        await db.snapshot.findMany({
          where: { month, year, type },
          select: { content: true, createdAt: true }
        })
    )
})
