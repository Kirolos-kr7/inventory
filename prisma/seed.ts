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

  await prisma.financeList.createMany({
    data: [
      { type: "income", name: "اشتراكات" },
      { type: "income", name: "تبرعات" },
      { type: "income", name: "مبيعات" },
      { type: "expense", name: "ايجار" },
      { type: "expense", name: "مرتبات" },
      { type: "expense", name: "كهرباء" },
      { type: "expense", name: "مياه" },
      { type: "expense", name: "غاز" },
      { type: "expense", name: "طعام" },
      { type: "expense", name: "نثريات" },
    ],
  })
}

main()
