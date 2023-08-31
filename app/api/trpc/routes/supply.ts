import { MONTHS } from '@/utils/dayjs'
import { db } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const supplyRouter = router({
  getHomeData: protectedProcedure
    .input(
      z.object({
        month: z.string(),
        year: z.string()
      })
    )
    .query(async ({ input: { month, year } }) => {
      const data = await db.supply.findMany({
        where: { month, year }
      })

      return {
        supply:
          data.length > 0
            ? data
                .map(({ price, count }) => price * count)
                .reduce((acc, curr) => (acc += curr))
            : 0
      }
    }),
  getSupplyList: protectedProcedure.query(
    async () => await db.item.findMany({ select: { id: true, name: true } })
  ),
  getSupplyPerMonth: protectedProcedure
    .input(z.object({ month: z.string(), year: z.string() }))
    .query(
      async ({ input: { month, year } }) =>
        await db.supply.findMany({
          where: { month, year },
          include: { src: true },
          orderBy: {
            src: {
              id: 'asc'
            }
          }
        })
    ),
  getSupplyTableData: protectedProcedure
    .input(
      z.object({
        year: z.string()
      })
    )
    .query(
      async ({ input: { year } }) =>
        await db.supply.findMany({
          where: {
            OR: [
              {
                year,
                month: {
                  in: MONTHS.slice(6, 12)
                }
              },
              {
                year: `${parseInt(year) + 1}`,
                month: {
                  in: MONTHS.slice(0, 6)
                }
              }
            ]
          },
          include: { src: true }
        })
    ),
  addToSupply: protectedProcedure
    .input(
      z.object({
        supply: z.array(
          z.object({
            src: z.object({
              id: z.number(),
              name: z.string()
            }),

            count: z
              .number({
                invalid_type_error: 'قيمة غير صالحة'
              })
              .gt(0, 'غير مسموج بقيمة اقل من 1'),
            pricePerUnit: z.number()
          })
        ),
        month: z.string(),
        year: z.string()
      })
    )
    .mutation(async ({ input: { supply, month, year }, ctx: { user } }) => {
      await Promise.all(
        supply.map(async ({ src, count, pricePerUnit }) => {
          await db.supply.create({
            data: {
              month,
              year,
              srcId: src.id,
              count,
              price: pricePerUnit
            }
          })

          await db.item.update({
            where: { id: src.id },
            data: {
              count: {
                increment: count
              }
            }
          })

          await db.transaction.create({
            data: {
              itemId: src.id,
              message: `قام ##### بالاضافة للمخزون بمقدار ${count}`,
              userId: user?.id!
            }
          })
        })
      )
    }),
  delete: protectedProcedure
    .input(
      z.object({
        supplyId: z.number(),
        removeStock: z.boolean()
      })
    )
    .mutation(async ({ input: { supplyId, removeStock } }) => {
      const transactions: any[] = [
        db.supply.delete({
          where: {
            id: supplyId
          }
        })
      ]

      if (removeStock) {
        const supply = await db.supply.findUnique({
          where: { id: supplyId }
        })

        if (!supply) return new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })

        transactions.push(
          db.item.update({
            where: { id: supply?.srcId },
            data: {
              count: {
                decrement: supply?.count
              }
            }
          })
        )
      }

      await db.$transaction(transactions)
    })
})
