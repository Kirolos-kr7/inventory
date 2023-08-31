import { TRPCError, initTRPC } from '@trpc/server'
import SuperJSON from 'superjson'
import { Context } from './[trpc]/context'

export const t = initTRPC.context<Context>().create({
  transformer: SuperJSON
})

export const router = t.router

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

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
