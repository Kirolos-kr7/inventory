import { MONTHS } from '@/utils/dayjs'
import { genJWT } from '@/utils/jwt'
import { db } from '@/utils/prisma'
import { TRPCError, initTRPC } from '@trpc/server'
import { compare, genSalt, hash } from 'bcrypt'
import superjson from 'superjson'
import { z } from 'zod'
import { Context } from './[trpc]/context'

export const t = initTRPC.context<Context>().create({
  transformer: superjson
})

export const isAuthed = t.middleware((opts) => {
  const {
    ctx: { user }
  } = opts
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next({
    ctx: {
      user
    }
  })
})

const protectedProcedure = t.procedure.use(isAuthed)

const authRouter = t.router({
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
  login: t.procedure
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

const itemRouter = t.router({
  getAll: protectedProcedure.query(async () => {
    return db.item.findMany({
      orderBy: {
        id: 'asc'
      }
    })
  }),
  add: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        count: z.number(),
        perBag: z.number()
      })
    )
    .mutation(async ({ input, ctx: { user } }) => {
      const { name, count = 0 } = input

      const item = await db.item.create({
        data: {
          name,
          count
        }
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

const transactionRouter = t.router({
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
              count: operation
            },
            where: { id: itemId }
          })

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
    }),
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

const financeType = z.enum(['income', 'expense'])

const financeRouter = t.router({
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

const supplyRouter = t.router({
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
    })
})

const metaRouter = t.router({
  get: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return (
      (
        await db.meta.findUnique({
          where: {
            key: input
          }
        })
      )?.value || 0
    )
  }),
  set: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { key, value } = input

      await db.meta.upsert({
        where: {
          key
        },
        create: {
          key,
          value
        },
        update: {
          value
        }
      })
    })
})

const doneeRouter = t.router({
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

const checkoutRouter = t.router({
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
    })
})

export const appRouter = t.router({
  auth: authRouter,
  item: itemRouter,
  transaction: transactionRouter,
  finance: financeRouter,
  supply: supplyRouter,
  meta: metaRouter,
  donee: doneeRouter,
  checkout: checkoutRouter
})

export type AppRouter = typeof appRouter
