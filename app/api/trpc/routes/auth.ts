import { genJWT } from '@/utils/jwt'
import { db } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'
import { compare, genSalt, hash } from 'bcrypt'
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const authRouter = router({
  getAll: protectedProcedure.query(async () => {
    return db.user.findMany({
      where: {
        isDeleted: false
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
  }),
  login: publicProcedure
    .input(
      z.object({
        name: z.string().toLowerCase(),
        password: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { name, password } = input

      const user = await db.user.findFirst({
        where: {
          name
        }
      })

      if (!user)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'اسم المستخدم غير موجود'
        })

      const isCorrectPassword = await compare(password, user.password)

      if (!isCorrectPassword)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'كلمة مرور غير صحيحة'
        })

      delete (user as any).password
      const token = await genJWT(user)

      return { token, user }
    }),
  add: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
        passwordConfirm: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { name, password, passwordConfirm } = input as any

      const user = await db.user.findUnique({
        where: {
          name
        }
      })

      if (user)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'اسم المستخدم مأخوذ, اختر اسم اخر'
        })

      await z
        .object({
          name: z
            .string()
            .min(2, 'يجب على اسم المستخدم ان يحتوي على الاقل على 2 أحرف'),
          password: z
            .string()
            .min(6, 'يجب على كلمة المرور ان تحتوي على الاقل على 6 أحرف'),
          passwordConfirm: z.string()
        })
        .superRefine(async ({ password, passwordConfirm }, ctx) => {
          if (password !== passwordConfirm)
            ctx.addIssue({
              code: 'custom',
              message: 'كلمات المرور غير متطابقة'
            })
        })
        .parseAsync({ name, password, passwordConfirm })

      const salt = await genSalt(10)
      const hashedPassword = await hash(password, salt)

      await db.user.create({
        data: { name, password: hashedPassword }
      })
    }),
  remove: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    await db.user.update({
      where: {
        id: input
      },
      data: {
        isDeleted: true
      }
    })
  }),
  getAdminCount: protectedProcedure.query(async () => {
    return db.user.count({
      where: {
        isAdmin: true
      }
    })
  }),
  updateInfo: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z
          .string()
          .min(2, 'يجب على اسم المستخدم ان يحتوي على الاقل على 2 أحرف'),
        isAdmin: z.boolean()
      })
    )
    .mutation(async ({ input }) => {
      const { id, name, isAdmin } = input

      await db.user.update({
        where: {
          id
        },
        data: {
          name,
          isAdmin
        }
      })
    }),
  updatePassword: protectedProcedure
    .input(
      z
        .object({
          id: z.number(),
          password: z
            .string()
            .min(6, 'يجب على كلمة المرور ان تحتوي على الاقل على 6 أحرف'),
          passwordConfirm: z.string()
        })
        .superRefine(async ({ password, passwordConfirm }, ctx) => {
          if (password !== passwordConfirm)
            ctx.addIssue({
              code: 'custom',
              message: 'كلمات المرور غير متطابقة'
            })
        })
    )
    .mutation(async ({ input }) => {
      const { id, password } = input

      const salt = await genSalt(10)
      const hashedPassword = await hash(password, salt)

      await db.user.update({
        where: { id },
        data: { password: hashedPassword }
      })
    })
})
