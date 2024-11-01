import { MONTHS } from '@/utils/dayjs'
import { db } from '@/utils/prisma'
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
    .input(
      z.object({
        month: z.string(),
        year: z.string(),
        view: z.enum(['table', 'timeline'])
      })
    )
    .query(
      async ({ input: { month, year, view } }) =>
        await db.supply.findMany({
          where: { month, year },
          include: { src: true },
          orderBy: {
            ...(view == 'timeline' ? { createdAt: 'desc' } : { srcId: 'asc' })
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
        supply: z.object({
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
        }),
        month: z.string(),
        year: z.string()
      })
    )
    .mutation(
      async ({
        input: {
          supply: { count, pricePerUnit, src },
          month,
          year
        },
        ctx: { user }
      }) => {
        await db.supply.create({
          data: {
            month,
            year,
            srcId: src.id,
            count,
            price: pricePerUnit
          }
        })

        await db.transaction.create({
          data: {
            itemId: src.id,
            message: `قام ##### بالاضافة للمخزون بمقدار ${count}`,
            userId: user?.id!
          }
        })
      }
    ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        count: z
          .number({
            invalid_type_error: 'قيمة غير صالحة'
          })
          .gt(0, 'غير مسموج بقيمة اقل من 1'),
        oldCount: z
          .number({
            invalid_type_error: 'قيمة غير صالحة'
          })
          .gt(0, 'غير مسموج بقيمة اقل من 1'),
        pricePerUnit: z.number()
      })
    )
    .mutation(
      async ({
        input: { id, count, oldCount, pricePerUnit },
        ctx: { user }
      }) => {
        const supply = await db.supply.update({
          where: { id },
          data: {
            count,
            price: pricePerUnit
          }
        })

        await db.transaction.create({
          data: {
            itemId: supply.srcId,
            message: `قام ##### ${
              count > oldCount ? 'بالاضافة' : 'بالخصم'
            } للمخزون بمقدار ${count}`,
            userId: user?.id!
          }
        })
      }
    ),
  delete: protectedProcedure
    .input(
      z.object({
        supplyId: z.number()
      })
    )
    .mutation(async ({ input: { supplyId } }) => {
      await db.supply.delete({
        where: {
          id: supplyId
        }
      })
    })
})
