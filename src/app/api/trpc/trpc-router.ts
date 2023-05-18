import { TRPCError, initTRPC } from "@trpc/server"
import { z } from "zod"
import superjson from "superjson"
import { prisma } from "@/utils/prisma"
import { genJWT } from "@/utils/jwt"
import { compare, hash, genSalt } from "bcrypt"
import { Context } from "./[trpc]/context"
import { setCookie } from "cookies-next"

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

const authRouter = t.router({
  getAll: t.procedure.query(async () => {
    return prisma.user.findMany()
  }),
  login: t.procedure
    .input(
      z.object({
        name: z.string().toLowerCase(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { name, password } = input

      const user = await prisma.user.findFirst({
        where: {
          name,
        },
      })

      if (!user)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "اسم المستخدم غير موجود",
        })

      const isCorrectPassword = await compare(password, user.password)

      if (!isCorrectPassword)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "كلمة مرور غير صحيحة",
        })

      delete (user as any).password
      const token = await genJWT(user)

      return token
    }),
  add: t.procedure
    .input(
      z
        .object({
          name: z
            .string()
            .min(2, "يجب على اسم المستخدم ان يحتوي على الاقل على 6 أحرف")
            .superRefine(async (name, ctx) => {
              const user = await prisma.user.findUnique({
                where: {
                  name,
                },
              })
              if (user)
                ctx.addIssue({
                  code: "custom",
                  message: "اسم المستخدم مأخوذ, اختر اسم اخر",
                })
            }),
          password: z
            .string()
            .min(6, "يجب على كلمة المرور ان تحتوي على الاقل على 6 أحرف"),
          passwordConfirm: z.string(),
        })
        .superRefine(async ({ password, passwordConfirm }, ctx) => {
          if (password !== passwordConfirm)
            ctx.addIssue({
              code: "custom",
              message: "كلمات المرور غير متطابقة",
            })
        })
    )
    .mutation(async ({ input }) => {
      const { name, password } = input

      const user = await prisma.user.findFirst({
        where: {
          name,
        },
      })

      if (user)
        return new TRPCError({
          code: "UNAUTHORIZED",
          message: "Name already taken",
        })

      const salt = await genSalt(10)
      const hashedPassword = await hash(password, salt)

      await prisma.user.create({
        data: { name, password: hashedPassword },
      })

      return "User added"
    }),
  removeUser: t.procedure.input(z.number()).mutation(async ({ input }) => {
    await prisma.user.delete({
      where: {
        id: input,
      },
    })

    return "User removed"
  }),
})

const itemRouter = t.router({
  getAll: t.procedure.query(async () => {
    return prisma.item.findMany({
      orderBy: {
        createdAt: "asc",
      },
    })
  }),
  add: t.procedure
    .input(
      z.object({
        name: z.string().min(2),
        count: z.number(),
        perBag: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { name, count = 0 } = input

      const item = await prisma.item.create({
        data: {
          name,
          count,
        },
      })

      await prisma.transaction.create({
        data: {
          userId: 1,
          itemId: item.id,
          message: `قام ${"كيرلس"} باضافة هذا العنصر`,
        },
      })
    }),
  remove: t.procedure.input(z.number()).mutation(async ({ input }) => {
    await prisma.item.delete({
      where: {
        id: input,
      },
    })
  }),
})

// user validation required
const transactionRouter = t.router({
  getAll: t.procedure.input(z.number().nullable()).query(async ({ input }) => {
    const where: { itemId?: number } = {}
    if (input) where.itemId = input

    return prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: "asc",
      },
    })
  }),
  updateCounts: t.procedure
    .input(
      z.array(
        z.object({
          itemId: z.number(),
          type: z.enum(["inc", "dec"]),
          by: z.number(),
        })
      )
    )
    .mutation(async ({ input: transactions }) => {
      transactions.forEach(async ({ itemId, type, by }) => {
        const operation: { increment?: number; decrement?: number } = {}

        if (type == "inc") operation.increment = by
        if (type == "dec") operation.decrement = by

        await prisma.item.update({
          data: {
            count: operation,
          },
          where: { id: itemId },
        })

        await prisma.transaction.create({
          data: {
            itemId,
            message: `قام ${"كيرلس"} ${
              type == "inc" ? "بزيادة المخزون" : "بالخصم من المخزون"
            } بمقدار ${by}`,
            userId: 1,
          },
        })
      })
    }),
  updateBag: t.procedure
    .input(
      z.array(
        z.object({
          itemId: z.number(),
          type: z.enum(["inc", "dec"]),
          by: z.number(),
        })
      )
    )
    .mutation(async ({ input: transactions }) => {
      await Promise.all(
        transactions.map(async ({ itemId, type, by }) => {
          const operation: { increment?: number; decrement?: number } = {}

          if (type == "inc") operation.increment = by
          if (type == "dec") operation.decrement = by

          await prisma.item.update({
            data: {
              perBag: operation,
            },
            where: { id: itemId },
          })

          prisma.transaction.create({
            data: {
              itemId,
              message: `قام ${"كيرلس"} ${
                type == "inc" ? "بزيادة العدد الشهري" : "بالخصم من العدد الشهري"
              } بمقدار ${by}`,
              userId: 1,
            },
          })
        })
      )
    }),
})

const metaRouter = t.router({
  get: t.procedure.input(z.string()).query(async ({ input }) => {
    return (
      (
        await prisma.meta.findUnique({
          where: {
            key: input,
          },
        })
      )?.value || 0
    )
  }),
  set: t.procedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { key, value } = input

      await prisma.meta.upsert({
        where: {
          key,
        },
        create: {
          key,
          value,
        },
        update: {
          value,
        },
      })
    }),
})

export const appRouter = t.router({
  auth: authRouter,
  item: itemRouter,
  transaction: transactionRouter,
  meta: metaRouter,
})

export type AppRouter = typeof appRouter
