import { db } from '@/utils/prisma'
import { Item, Prisma } from '@prisma/client'
import dayjs from 'dayjs'
require('dayjs/locale/ar')

export const dynamic = 'force-dynamic'
export async function GET() {
  dayjs.locale('ar')
  const month = dayjs().format('MMM')
  const year = dayjs().format('YY')

  const inventory = await db.item.findMany({
    select: {
      id: true,
      name: true,
      count: true
    }
  })

  const lastSnapshot = await db.snapshot.findFirst({
    where: { type: 'inventory', month, year },
    select: { content: true },
    orderBy: { createdAt: 'desc' }
  })

  if (lastSnapshot) {
    let notChanged = true
    const ss = lastSnapshot?.content as Prisma.JsonArray
    ss.map((sx) => {
      const item = sx as any as Item
      const foundAndUnchanged = inventory.find(
        ({ id, count }) => id == item.id && count == item.count
      )

      if (!!!foundAndUnchanged) {
        notChanged = false
        return
      }
    })

    if (notChanged)
      return Response.json({ status: false, message: 'Stale' }, { status: 200 })
  }

  await db.snapshot.create({
    data: {
      month,
      year,
      type: 'inventory',
      content: inventory
    }
  })

  return Response.json({ status: true, message: 'Done' }, { status: 200 })
}
