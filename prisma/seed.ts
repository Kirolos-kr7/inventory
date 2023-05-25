import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
})

const main = async () => {
  const user = await prisma.user.create({
    data: {
      name: "كيرلس",
      password: "$2a$10$.edjaS/EsDN4xT13QRwY9.TCpEzkT6izf78Fg0KxB8.itqW5UHmOG",
      isAdmin: true,
    },
  })

  await prisma.item.createMany({
    data: [
      {
        name: "رز",
      },
      {
        name: "سمنة",
      },
    ],
  })

  for (const itemId of [1, 2]) {
    await prisma.transaction.create({
      data: {
        userId: user?.id,
        itemId: itemId,
        message: `قام ##### باضافة هذا العنصر`,
      },
    })
  }

  await prisma.incomeList.createMany({
    data: [
      {
        name: "اشتراكات",
      },
      {
        name: "تبرعات",
      },
      {
        name: "مبيعات",
      },
    ],
  })

  await prisma.expenseList.createMany({
    data: [
      { name: "ايجار" },
      { name: "مرتبات" },
      { name: "كهرباء" },
      { name: "مياه" },
      { name: "غاز" },
      { name: "طعام" },
      { name: "ورق" },
    ],
  })
}

main()
