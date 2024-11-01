import { authRouter } from './routes/auth'
import { checkoutRouter } from './routes/checkout'
import { doneeRouter } from './routes/donees'
import { financeRouter } from './routes/finance'
import { itemRouter } from './routes/items'
import { metaRouter } from './routes/meta'
import { supplyRouter } from './routes/supply'
import { transactionRouter } from './routes/transactions'
import { router } from './trpc'

export const appRouter = router({
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
