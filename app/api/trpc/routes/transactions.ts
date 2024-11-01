import { db } from '@/utils/prisma'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const transactionRouter = router({
  getAll: protectedProcedure
    .input(z.number().nullable())
    .query(async ({ input }) => {
      const where: { itemId?: number } = {}
      if (input) where.itemId = input

      const transactions = await db.transaction.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          by: true
        }
      })

      return transactions.map(({ message, id, createdAt, by }) => {
        return { message: message.replace('#####', by.name), id, createdAt }
      })
    }),
  updateCounts: protectedProcedure
    .input(
      z.object({
        transactions: z.array(
          z.object({
            itemId: z.number(),
            type: z.enum(['inc', 'dec']),
            by: z.number()
          })
        ),
        month: z.string(),
        year: z.string()
      })
    )
    .mutation(
      async ({ input: { transactions, month, year }, ctx: { user } }) => {
        await Promise.all(
          transactions.map(async ({ itemId, type, by }) => {
            if (type == 'inc') {
              await db.supply.create({
                data: {
                  srcId: itemId,
                  count: by,
                  month,
                  year,
                  price: 0
                }
              })
            }
            if (type == 'dec') {
              await db.checkout.create({
                data: {
                  itemId,
                  month,
                  year,
                  doneeId: 0,
                  amount: by
                }
              })
            }

            await db.transaction.create({
              data: {
                itemId,
                message: `قام ##### ${
                  type == 'inc' ? 'بزيادة المخزون' : 'بالخصم من المخزون'
                } بمقدار ${by}`,
                userId: user?.id!
              }
            })
          })
        )
      }
    ),
  updateNames: protectedProcedure
    .input(
      z.array(
        z.object({
          itemId: z.number(),
          newVal: z.string(),
          oldVal: z.string()
        })
      )
    )
    .mutation(async ({ input: transactions, ctx: { user } }) => {
      await Promise.all(
        transactions.map(async ({ itemId, newVal, oldVal }) => {
          await db.item.update({
            data: {
              name: newVal
            },
            where: { id: itemId }
          })

          await db.transaction.create({
            data: {
              itemId,
              message: `قام ##### بتغيير اسم العنصر من (${oldVal}) الى (${newVal})`,
              userId: user?.id!
            }
          })
        })
      )
    }),
  updateBag: protectedProcedure
    .input(
      z.array(
        z.object({
          itemId: z.number(),
          type: z.enum(['inc', 'dec']),
          by: z.number()
        })
      )
    )
    .mutation(async ({ input: transactions, ctx: { user } }) => {
      await Promise.all(
        transactions.map(async ({ itemId, type, by }) => {
          const operation: { increment?: number; decrement?: number } = {}

          if (type == 'inc') operation.increment = by
          if (type == 'dec') operation.decrement = by

          await db.item.update({
            data: {
              perBag: operation
            },
            where: { id: itemId }
          })

          await db.transaction.create({
            data: {
              itemId,
              message: `قام ##### ${
                type == 'inc' ? 'بزيادة العدد الشهري' : 'بالخصم من العدد الشهري'
              } بمقدار ${by}`,
              userId: user?.id!
            }
          })
        })
      )
    })
})
