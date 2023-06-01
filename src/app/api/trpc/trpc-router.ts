import { TRPCError, initTRPC } from "@trpc/server"
import { z } from "zod"
import superjson from "superjson"
import { prisma } from "@/utils/prisma"
import { genJWT } from "@/utils/jwt"
import { compare, hash, genSalt } from "bcrypt"
import { Context } from "./[trpc]/context"

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const isAuthed = t.middleware((opts) => {
  const {
    ctx: { user },
  } = opts
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return opts.next({
    ctx: {
      user,
    },
  })
})

const publicProcedure = t.procedure
const protectedProcedure = publicProcedure.use(isAuthed)

const authRouter = t.router({
  getAll: protectedProcedure.query(async () => {
    return prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    })
  }),
  login: publicProcedure
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

      return { token, user }
    }),
  add: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
        passwordConfirm: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { name, password, passwordConfirm } = input as any

      const user = await prisma.user.findUnique({
        where: {
          name,
        },
      })

      if (user)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "اسم المستخدم مأخوذ, اختر اسم اخر",
        })

      await z
        .object({
          name: z
            .string()
            .min(2, "يجب على اسم المستخدم ان يحتوي على الاقل على 2 أحرف"),
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
        .parseAsync({ name, password, passwordConfirm })

      const salt = await genSalt(10)
      const hashedPassword = await hash(password, salt)

      await prisma.user.create({
        data: { name, password: hashedPassword },
      })
    }),
  remove: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    await prisma.user.update({
      where: {
        id: input,
      },
      data: {
        isDeleted: true,
      },
    })
  }),
  getAdminCount: protectedProcedure.query(async () => {
    return prisma.user.count({
      where: {
        isAdmin: true,
      },
    })
  }),
  updateInfo: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z
          .string()
          .min(2, "يجب على اسم المستخدم ان يحتوي على الاقل على 2 أحرف"),
        isAdmin: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, name, isAdmin } = input

      await prisma.user.update({
        where: {
          id,
        },
        data: {
          name,
          isAdmin,
        },
      })
    }),
  updatePassword: protectedProcedure
    .input(
      z
        .object({
          id: z.number(),
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
      const { id, password } = input

      const salt = await genSalt(10)
      const hashedPassword = await hash(password, salt)

      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      })
    }),
})

const itemRouter = t.router({
  getAll: protectedProcedure.query(async () => {
    return prisma.item.findMany({
      orderBy: {
        createdAt: "asc",
      },
    })
  }),
  add: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        count: z.number(),
        perBag: z.number(),
      })
    )
    .mutation(async ({ input, ctx: { user } }) => {
      const { name, count = 0 } = input

      const item = await prisma.item.create({
        data: {
          name,
          count,
        },
      })

      await prisma.transaction.create({
        data: {
          userId: user?.id!,
          itemId: item.id,
          message: `قام ##### باضافة هذا العنصر`,
        },
      })
    }),
  remove: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    await prisma.item.delete({
      where: {
        id: input,
      },
    })
  }),
})

const transactionRouter = t.router({
  getAll: protectedProcedure
    .input(z.number().nullable())
    .query(async ({ input }) => {
      const where: { itemId?: number } = {}
      if (input) where.itemId = input

      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          by: true,
        },
      })

      return transactions.map(({ message, id, createdAt, by }) => {
        return { message: message.replace("#####", by.name), id, createdAt }
      })
    }),
  updateCounts: protectedProcedure
    .input(
      z.array(
        z.object({
          itemId: z.number(),
          type: z.enum(["inc", "dec"]),
          by: z.number(),
        })
      )
    )
    .mutation(async ({ input: transactions, ctx: { user } }) => {
      await Promise.all(
        transactions.map(async ({ itemId, type, by }) => {
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
              message: `قام ##### ${
                type == "inc" ? "بزيادة المخزون" : "بالخصم من المخزون"
              } بمقدار ${by}`,
              userId: user?.id!,
            },
          })
        })
      )
    }),
  updateNames: protectedProcedure
    .input(
      z.array(
        z.object({
          itemId: z.number(),
          newVal: z.string(),
          oldVal: z.string(),
        })
      )
    )
    .mutation(async ({ input: transactions, ctx: { user } }) => {
      await Promise.all(
        transactions.map(async ({ itemId, newVal, oldVal }) => {
          await prisma.item.update({
            data: {
              name: newVal,
            },
            where: { id: itemId },
          })

          await prisma.transaction.create({
            data: {
              itemId,
              message: `قام ##### بتغيير اسم العنصر من (${oldVal}) الى (${newVal})`,
              userId: user?.id!,
            },
          })
        })
      )
    }),
  updateBag: protectedProcedure
    .input(
      z.array(
        z.object({
          itemId: z.number(),
          type: z.enum(["inc", "dec"]),
          by: z.number(),
        })
      )
    )
    .mutation(async ({ input: transactions, ctx: { user } }) => {
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

          await prisma.transaction.create({
            data: {
              itemId,
              message: `قام ##### ${
                type == "inc" ? "بزيادة العدد الشهري" : "بالخصم من العدد الشهري"
              } بمقدار ${by}`,
              userId: user?.id!,
            },
          })
        })
      )
    }),
})

const financeType = z.enum(["income", "expense"])

const financeRouter = t.router({
  getByMix: protectedProcedure
    .input(
      z.object({
        type: financeType,
        month: z.string(),
        year: z.string(),
      })
    )
    .query(async ({ input: { month, year, type } }) => {
      const financeList = await prisma.financeList.findMany({
        where: { type },
      })

      try {
        return await Promise.all(
          financeList?.map(async ({ id: srcId }) => {
            return await prisma.finance.upsert({
              where: { srcId_month_year_type: { srcId, month, year, type } },
              create: { srcId, month, year, type },
              update: {},
              include: { src: true },
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
        await prisma.financeList.findMany({ where: { type } })
    ),
  getFinanceTableData: protectedProcedure
    .input(
      z.object({
        type: financeType,
        year: z.string(),
      })
    )
    .query(async ({ input: { year, type } }) => {
      return await prisma.finance.findMany({
        where: { year, type },
        include: { src: true },
      })
    }),
  updateFinance: protectedProcedure
    .input(
      z.array(
        z.object({
          src: z.object({
            id: z.number(),
            name: z.string(),
          }),
          month: z.string(),
          year: z.string(),
          price: z.number(),
          type: financeType,
        })
      )
    )
    .mutation(async ({ input: expense }) => {
      await Promise.all(
        expense.map(async ({ src, month, year, price, type }) => {
          await prisma.finance.update({
            where: {
              srcId_month_year_type: { srcId: src.id, month, year, type },
            },
            data: {
              price,
            },
          })
        })
      )
    }),
})

const supplyRouter = t.router({
  // getByMix: protectedProcedure
  //   .input(
  //     z.object({
  //       type: financeType,
  //       month: z.string(),
  //       year: z.string(),
  //     })
  //   )
  //   .query(async ({ input: { month, year, type } }) => {
  //     const financeList = await prisma.financeList.findMany({
  //       where: { type },
  //     })

  //     try {
  //       return await Promise.all(
  //         financeList?.map(async ({ id: srcId }) => {
  //           return await prisma.finance.upsert({
  //             where: { srcId_month_year_type: { srcId, month, year, type } },
  //             create: { srcId, month, year, type },
  //             update: {},
  //             include: { src: true },
  //           })
  //         })
  //       )
  //     } catch (err) {
  //       console.log(err)
  //     }
  //   }),
  getSupplyList: protectedProcedure.query(
    async () => await prisma.item.findMany({ select: { id: true, name: true } })
  ),
  getSupplyTableData: protectedProcedure
    .input(
      z.object({
        year: z.string(),
      })
    )
    .query(async ({ input: { year } }) => {
      return await prisma.supply.findMany({
        where: { year },
        include: { src: true },
      })
    }),
  addToSupply: protectedProcedure
    .input(
      z.object({
        supply: z.array(
          z.object({
            src: z.object({
              id: z.number(),
              name: z.string(),
            }),

            count: z
              .number({
                invalid_type_error: "قيمة غير صالحة",
              })
              .gt(0, "غير مسموج بقيمة اقل من 1"),
            pricePerUnit: z.number(),
          })
        ),
        month: z.string(),
        year: z.string(),
      })
    )
    .mutation(async ({ input: { supply, month, year }, ctx: { user } }) => {
      await Promise.all(
        supply.map(async ({ src, count, pricePerUnit }) => {
          await prisma.supply.create({
            data: {
              month,
              year,
              srcId: src.id,
              count,
              price: pricePerUnit,
            },
          })

          await prisma.item.update({
            where: { id: src.id },
            data: {
              count: {
                increment: count,
              },
            },
          })

          await prisma.transaction.create({
            data: {
              itemId: src.id,
              message: `قام ##### بالاضافة للمخزون بمقدار ${count}`,
              userId: user?.id!,
            },
          })
        })
      )
    }),
})

const metaRouter = t.router({
  get: protectedProcedure.input(z.string()).query(async ({ input }) => {
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
  set: protectedProcedure
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
  finance: financeRouter,
  supply: supplyRouter,
  meta: metaRouter,
})

export type AppRouter = typeof appRouter
