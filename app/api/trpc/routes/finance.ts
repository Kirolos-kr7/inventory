import { MONTHS } from '@/utils/dayjs'
import { db } from '@/utils/prisma'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

const financeType = z.enum(['income', 'expense'])

export const financeRouter = router({
  getHomeData: protectedProcedure
    .input(
      z.object({
        month: z.string(),
        year: z.string()
      })
    )
    .query(async ({ input: { month, year } }) => {
      let income = 0
      let expense = 0

      const data = await db.finance.findMany({
        where: { month, year }
      })

      data.forEach(({ type, price }) => {
        if (type == 'income') income += price
        if (type == 'expense') expense += price
      })

      return {
        income,
        expense
      }
    }),
  getByMix: protectedProcedure
    .input(
      z.object({
        type: financeType,
        month: z.string(),
        year: z.string()
      })
    )
    .query(async ({ input: { month, year, type } }) => {
      const financeList = await db.financeList.findMany({
        where: { type }
      })

      try {
        return await Promise.all(
          financeList?.map(async ({ id: srcId }) => {
            return await db.finance.upsert({
              where: { srcId_month_year_type: { srcId, month, year, type } },
              create: { srcId, month, year, type },
              update: {},
              include: { src: true }
            })
          })
        )
      } catch (err) {
        console.log(err)
      }
    }),
  getFinanceList: protectedProcedure
    .input(z.object({ type: financeType }))
    .query(
      async ({ input: { type } }) =>
        await db.financeList.findMany({ where: { type } })
    ),
  getFinanceTableData: protectedProcedure
    .input(
      z.object({
        type: financeType,
        year: z.string()
      })
    )
    .query(
      async ({ input: { year, type } }) =>
        await db.finance.findMany({
          where: {
            OR: [
              { year, type, month: { in: MONTHS.slice(6, 12) } },
              {
                year: `${parseInt(year) + 1}`,
                type,
                month: { in: MONTHS.slice(0, 6) }
              }
            ]
          },
          include: { src: true }
        })
    ),
  updateFinance: protectedProcedure
    .input(
      z.array(
        z.object({
          type: financeType,
          srcId: z.number(),
          month: z.string(),
          year: z.string(),
          price: z.number()
        })
      )
    )
    .mutation(async ({ input }) => {
      await Promise.all(
        input.map(async ({ type, srcId, month, year, price }) => {
          await db.finance.upsert({
            where: {
              srcId_month_year_type: { srcId, month, year, type }
            },
            create: { type, srcId, month, year, price },
            update: { price }
          })
        })
      )
    })
})
