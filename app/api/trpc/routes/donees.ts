import { db } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const doneeRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db.donee.findMany({
      include: { location: true },
      orderBy: [{ locationId: 'asc' }, { id: 'asc' }]
    })
  }),
  getCount: protectedProcedure.query(
    async () =>
      await db.donee.count({
        where: { isRegular: true }
      })
  ),
  getLocations: protectedProcedure.query(async () => {
    return await db.serviceArea.findMany({
      orderBy: {
        id: 'asc'
      }
    })
  }),
  add: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(2, 'يجب على اسم المخدوم ان يحتوي على الاقل على 2 أحرف')
          .trim(),
        location: z.number(),
        isRegular: z.boolean()
      })
    )
    .mutation(async ({ input: { name, location, isRegular } }) => {
      const donee = await db.donee.findUnique({
        where: {
          name
        }
      })

      if (donee)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'اسم المخدوم مأخوذ, اختر اسم اخر'
        })

      await db.donee.create({
        data: { name, locationId: location, isRegular }
      })
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z
          .string()
          .min(2, 'يجب على اسم المخدوم ان يحتوي على الاقل على 2 أحرف'),
        location: z.number(),
        isRegular: z.boolean()
      })
    )
    .mutation(async ({ input }) => {
      const { id, name, location, isRegular } = input

      await db.donee.update({
        where: {
          id
        },
        data: {
          name,
          locationId: location,
          isRegular
        }
      })
    }),
  remove: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    await db.donee.delete({
      where: { id: input }
    })
  })
})
