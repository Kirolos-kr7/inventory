import { db } from '@/utils/prisma'
import { ItemWithCount } from '@/utils/types'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const itemRouter = router({
  getAll: protectedProcedure.query(async () => {
    const supply = await db.supply.findMany({
      include: {
        src: true
      }
    })

    const totalSupply = supply.reduce(
      (acc: Record<number, ItemWithCount>, entry) => {
        if (!acc[entry.srcId])
          acc[entry.srcId] = {
            id: entry.srcId,
            name: entry.src.name,
            count: 0,
            perBag: entry.src.perBag,
            createdAt: entry.src.createdAt
          }

        acc[entry.srcId] = {
          ...entry.src,
          count: acc[entry.srcId].count + entry.count
        }

        return acc
      },
      {}
    )

    const checkout = await db.checkout.findMany()

    const totalCheckedOut = checkout.reduce(
      (acc: Record<number, number>, entry) => {
        if (!acc[entry.itemId]) acc[entry.itemId] = 0

        acc[entry.itemId] += entry.amount

        return acc
      },
      {}
    )

    const result = Object.values(totalSupply).map((src) => {
      src.count = src.count - (totalCheckedOut[src.id] ?? 0)

      return src
    })

    return result
  }),
  add: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        perBag: z.number()
      })
    )
    .mutation(async ({ input, ctx: { user } }) => {
      const { name } = input

      const item = await db.item.create({
        data: { name }
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
