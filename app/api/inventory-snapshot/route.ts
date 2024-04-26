import { db } from '@/utils/prisma'
import dayjs from 'dayjs'
require('dayjs/locale/ar')

export const dynamic = 'force-dynamic'
export async function GET() {
  const inventory = await db.item.findMany({
    select: {
      id: true,
      name: true,
      count: true
    }
  })

  dayjs.locale('ar')
  const month = dayjs().format('MMM')
  const year = dayjs().format('YY')

  await db.snapshot.create({
    data: {
      month,
      year,
      type: 'inventory',
      content: inventory
    }
  })

  return Response.json({}, { status: 200 })
}
