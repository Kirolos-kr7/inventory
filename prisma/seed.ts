import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
})

const main = async () => {
  console.time("Seed finished in")

  await prisma.user.create({
    data: {
      name: "كيرلس",
      password: "$2a$10$.edjaS/EsDN4xT13QRwY9.TCpEzkT6izf78Fg0KxB8.itqW5UHmOG",
      isAdmin: true,
    },
  })

  await prisma.item.createMany({
    data: [
      { name: "رز", perBag: 2, count: 107 },
      { name: "سكر", perBag: 2, count: 79 },
      { name: "مكرونة", perBag: 2, count: 123 },
      { name: "شاي", perBag: 2, count: 6 },
      { name: "زيت", perBag: 0, count: 23 },
      { name: "فراخ", perBag: 1, count: 0 },
      { name: "لحمة", perBag: 1, count: 0 },
      { name: "ملح", perBag: 0, count: 28 },
      { name: "عدس", perBag: 1, count: 17 },
      { name: "سمنة", perBag: 1, count: 40 },
      { name: "لبن", perBag: 1, count: 0 },
      { name: "جبنة", perBag: 1, count: 0 },
    ],
  })

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
        key: "initYear",
        value: "23",
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
      // عين شمس
      { name: "ماري ذكي", locationId: 1 },
      { name: "سعاد ناشد جرجس عطية", locationId: 1 },
      { name: "انعام عبدالله اخنوخ دميان", locationId: 1 },
      { name: "مريم جمال بديع بخيت", locationId: 1 },
      { name: "نانا فوزي عياد جرجس", locationId: 1 },
      { name: "عاطف لمعي زكي ميخائيل", locationId: 1 },
      { name: "ايناس عدلي مجلي هندي", locationId: 1 },
      { name: "عايدة رفعت جبرة", locationId: 1 },
      { name: "سلوى عطية عطوان مفتاح", locationId: 1 },
      { name: "ماجدة راجي عبد السيد", locationId: 1 },
      // عزبة النخل
      { name: "روماني فلى حنين حنا", locationId: 2 },
      { name: "فكري وليم إبراهيم جرجس", locationId: 2 },
      { name: "وجدي درنير يونان ميخائيل", locationId: 2 },
      //المرج
      { name: "اكرم شمشوم زكي داود", locationId: 3 },
      { name: "ايمن رمزي ثابت حرز", locationId: 3 },
      { name: "كوثر فارس عبدالملك يوسف", locationId: 3 },
      { name: "جميل سليمان سدره بخيت", locationId: 3 },
      { name: "هند فضل ملك إبراهيم", locationId: 3 },
      { name: "نيفين فتحي شوقي زكي ", locationId: 3 },
      { name: "كميلة ولسن عوض تاوضروس", locationId: 3 },
      { name: "لمعي وجيه عطالله عبدالشهيد", locationId: 3 },
      { name: "سعاد عبدالمسيح جرس جرجس", locationId: 3 },
      { name: "وجيه نصيف إبراهيم بشاي", locationId: 3 },
      { name: "عايدة إبراهيم يوسف إبراهيم", locationId: 3 },
      { name: "فرجه فريج نجيب عطوان", locationId: 3 },
      { name: "اسحق ميخائيل عبد المسيح", locationId: 3 },
      // المنوفية
      { name: "سامي كامل غالي", locationId: 4 },
      { name: "هاني كامل عبد المسيح", locationId: 4 },
      { name: "عبد السيد كامل غالي", locationId: 4 },
      { name: "فايزة يوسف غالي", locationId: 4 },
      { name: "مريم فهمي مرقص", locationId: 4 },
      { name: "نادية بشارة يوسف", locationId: 4 },
      { name: "فايزة وهبة برسوم", locationId: 4 },
      { name: "ماهر كامل اسعد عوض الله", locationId: 4 },
      { name: "إيهاب مهني عبد الشهيد", locationId: 4 },
    ],
  })

  console.timeEnd("Seed finished in")
}

main()
