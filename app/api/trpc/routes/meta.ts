import { db } from '@/utils/prisma'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const metaRouter = router({
  get: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return (
      (
        await db.meta.findUnique({
          where: {
            key: input
          }
        })
      )?.value || 0
    )
  }),
  set: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { key, value } = input

      await db.meta.upsert({
        where: {
          key
        },
        create: {
          key,
          value
        },
        update: {
          value
        }
      })
    })
})
