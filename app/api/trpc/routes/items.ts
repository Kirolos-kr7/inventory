import { db } from '@/utils/prisma'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const itemRouter = router({
  getAll: protectedProcedure.query(async () => {
    return db.item.findMany({
      orderBy: {
        id: 'asc'
      }
    })
  }),
  add: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        count: z.number(),
        perBag: z.number()
      })
    )
    .mutation(async ({ input, ctx: { user } }) => {
      const { name, count = 0 } = input

      const item = await db.item.create({
        data: {
          name,
          count
        }
      })

      await db.transaction.create({
        data: {
          userId: user?.id!,
          itemId: item.id,
          message: `قام ##### باضافة هذا العنصر`
        }
      })
    }),
  remove: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    await db.item.delete({
      where: {
        id: input
      }
    })
  })
})
