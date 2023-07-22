import { PrismaClient } from '@prisma/client'
import { runBackup } from '@vorlefan/prisma-backup'

const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

void (async function () {
  const [
    checkout,
    donee,
    finance,
    financeList,
    item,
    meta,
    serviceArea,
    supply,
    transaction,
    user
  ] = await db.$transaction([
    db.checkout.findMany(),
    db.donee.findMany(),
    db.finance.findMany(),
    db.financeList.findMany(),
    db.item.findMany(),
    db.meta.findMany(),
    db.serviceArea.findMany(),
    db.supply.findMany(),
    db.transaction.findMany(),
    db.user.findMany()
  ])

  await runBackup({
    models: {
      checkout,
      donee,
      finance,
      financeList,
      item,
      meta,
      serviceArea,
      supply,
      transaction,
      user
    }
  })
})()
