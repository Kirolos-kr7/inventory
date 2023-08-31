import { db } from '@/utils/prisma'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const checkoutRouter = router({
  getByMix: protectedProcedure
    .input(
      z.object({
        month: z.string(),
        year: z.string()
      })
    )
    .query(
      async ({ input: { month, year } }) =>
        await db.checkout.findMany({
          where: { month, year }
        })
    ),
  progress: protectedProcedure
    .input(z.object({ month: z.string(), year: z.string() }))
    .query(async ({ input: { month, year } }) => {
      const donees = await db.donee.findMany({ where: { isRegular: true } })
      const locations = await db.serviceArea.findMany({
        orderBy: { id: 'asc' }
      })

      const progress = await Promise.all(
        donees.map(async ({ id, locationId }) => ({
          location: locationId,
          value: await db.checkout.findFirst({
            where: { month, year, doneeId: id, amount: { gt: 0 } }
          })
        }))
      )

      return { progress, locations }
    }),
  update: protectedProcedure
    .input(
      z.object({
        changes: z.array(
          z.object({
            doneeId: z.number(),
            itemId: z.number(),
            amount: z.number(),
            diff: z.number()
          })
        ),
        month: z.string(),
        year: z.string()
      })
    )
    .mutation(async ({ input: { changes, month, year } }) => {
      await Promise.all(
        changes.map(async ({ doneeId, itemId, amount, diff }) => {
          if (amount == 0)
            await db.checkout.delete({
              where: {
                doneeId_itemId_month_year: { doneeId, itemId, month, year }
              }
            })
          else
            await db.checkout.upsert({
              where: {
                doneeId_itemId_month_year: { doneeId, itemId, month, year }
              },
              create: { doneeId, itemId, month, year, amount },
              update: { amount }
            })

          const operation: { increment?: number; decrement?: number } =
            diff < 0 ? { increment: Math.abs(diff) } : { decrement: diff }

          await db.item.update({
            where: { id: itemId },
            data: { count: operation }
          })
        })
      )
    }),
  outBags: protectedProcedure
    .input(
      z.object({
        donees: z.array(z.number()),
        month: z.string(),
        year: z.string()
      })
    )
    .mutation(async ({ input: { donees, month, year } }) => {
      const items = await db.item.findMany({
        where: { perBag: { gt: 0 } },
        select: { id: true, perBag: true }
      })

      await Promise.all(
        donees.map(
          async (dId) =>
            await Promise.all(
              items.map(async ({ id: iId, perBag }) => {
                await db.item.update({
                  where: { id: iId },
                  data: {
                    count: { decrement: perBag },
                    Checkout: {
                      create: {
                        doneeId: dId,
                        month,
                        year,
                        amount: perBag
                      }
                    }
                  }
                })
              })
            )
        )
      )
    })
})
