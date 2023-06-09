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
      { id: 1, name: "رز", perBag: 2 },
      { id: 2, name: "سكر", perBag: 2 },
      { id: 3, name: "مكرونة", perBag: 2 },
      { id: 4, name: "فراخ / لحمة", perBag: 1 },
      { id: 5, name: "شاي", perBag: 2 },
      { id: 6, name: "ملح", perBag: 2 },
      { id: 7, name: "زيت", perBag: 0 },
      { id: 8, name: "عدس", perBag: 1 },
      { id: 9, name: "سمنة", perBag: 1 },
      { id: 10, name: "لبن", perBag: 1 },
      { id: 11, name: "جبنة", perBag: 1 },
    ],
  })

  for (const itemId of [1, 11]) {
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

  await prisma.meta.createMany({
    data: [
      {
        key: "monthlyBags",
        value: "35",
      },
      {
        key: "initYear",
        value: "22",
      },
    ],
  })

  await prisma.serviceArea.createMany({
    data: [
      { name: "عين شمس" },
      { name: "عزبة النخل" },
      { name: "المرج" },
      { name: "المنوفية" },
    ],
  })

  await prisma.donee.createMany({
    data: [
      { name: "مخدوم x", locationId: 1 },
      { name: "مخدوم y", locationId: 1 },
      { name: "مخدوم z", locationId: 1 },
      { name: "مخدوم a", locationId: 2 },
      { name: "مخدوم b", locationId: 2 },
    ],
  })
}

main()
