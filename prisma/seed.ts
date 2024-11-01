import { PrismaClient } from '@prisma/client'
const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const main = async () => {
  console.time('Seed finished in')

  const user = await db.user.create({
    data: {
      name: 'كيرلس',
      password: '$2a$10$.edjaS/EsDN4xT13QRwY9.TCpEzkT6izf78Fg0KxB8.itqW5UHmOG',
      isAdmin: true
    }
  })

  const itemsPayload = [
    { id: 1, name: 'رز', perBag: 2 },
    { id: 2, name: 'سكر', perBag: 2 },
    { id: 3, name: 'مكرونة', perBag: 2 },
    { id: 4, name: 'شاي', perBag: 2 },
    { id: 5, name: 'زيت', perBag: 1 },
    { id: 6, name: 'فراخ', perBag: 0 },
    { id: 7, name: 'لحمة', perBag: 1 },
    { id: 8, name: 'ملح', perBag: 0 },
    { id: 9, name: 'عدس', perBag: 0 },
    { id: 10, name: 'سمنة', perBag: 0 },
    { id: 11, name: 'لبن', perBag: 0 },
    { id: 12, name: 'جبنة', perBag: 0 }
  ]

  await db.item.createMany({
    data: itemsPayload
  })

  await Promise.all(
    itemsPayload.map(
      async ({ id }) =>
        await db.transaction.create({
          data: {
            userId: user.id,
            message: `قام ##### باضافة هذا العنصر`,
            itemId: id
          }
        })
    )
  )

  await db.financeList.createMany({
    data: [
      { type: 'income', name: 'اشتراكات' },
      { type: 'income', name: 'تبرعات' },
      { type: 'income', name: 'مبيعات' },
      { type: 'expense', name: 'ايجار' },
      { type: 'expense', name: 'مرتبات' },
      { type: 'expense', name: 'كهرباء' },
      { type: 'expense', name: 'مياه' },
      { type: 'expense', name: 'غاز' },
      { type: 'expense', name: 'طعام' },
      { type: 'expense', name: 'نثريات' }
    ]
  })

  await db.meta.createMany({
    data: [
      {
        key: 'initYear',
        value: '23'
      }
    ]
  })

  await db.serviceArea.createMany({
    data: [
      { name: 'عين شمس' },
      { name: 'عزبة النخل' },
      { name: 'المرج' },
      { name: 'المنوفية' }
    ]
  })

  await db.donee.createMany({
    data: [
      // عين شمس
      { name: 'سعاد ناشد جرجس عطية', locationId: 1 },
      { name: 'انعام عبدالله اخنوخ دميان', locationId: 1 },
      { name: 'نانا فوزي عياد جرجس', locationId: 1 },
      { name: 'عاطف لمعي زكي ميخائيل', locationId: 1 },
      { name: 'ايناس عدلي مجلي هندي', locationId: 1 },
      { name: 'عايدة رفعت جبرة', locationId: 1 },
      { name: 'ماري ذكي زخاري سليمان', locationId: 1 },
      { name: 'جمال ويصا حنا ميخائيل', locationId: 1 },
      { name: 'مهرائيل عبداامسيح', locationId: 1 },
      { name: 'نوال فوزي', locationId: 1 },
      { name: 'أميرة ماهر', locationId: 1 },
      { name: 'جانيت ممدوح بشرى', locationId: 1 },
      { name: 'سماح سامي', locationId: 1 },
      { name: 'سعاد عبده', locationId: 1 },
      // عزبة النخل
      { name: 'فكري وليم إبراهيم جرجس', locationId: 2 },
      { name: 'مها فكري وليم إبراهيم', locationId: 2 },
      { name: 'حنان يوسف كمال بطرس', locationId: 2 },
      //المرج
      { name: 'اكرم شمشوم زكي داود', locationId: 3 },
      { name: 'ايمن رمزي ثابت حرز', locationId: 3 },
      { name: 'كوثر فارس عبدالملك يوسف', locationId: 3 },
      { name: 'هند فضل ملك إبراهيم', locationId: 3 },
      { name: 'لمعي وجيه عطالله عبدالشهيد', locationId: 3 },
      { name: 'وجيه نصيف إبراهيم بشاي', locationId: 3 },
      { name: 'اسحق ميخائيل عبد المسيح', locationId: 3 },
      { name: 'هند فوزي رزق الله سيف', locationId: 3 },
      { name: 'سيد خليل راغب عبدالملاك', locationId: 3 },
      { name: 'عاطف شنودة فهمي جبرة', locationId: 3 },
      { name: 'منير سليم بطرس', locationId: 3 },
      { name: 'فرحة فريج نجيب عطوان', locationId: 3 },
      { name: 'اسامة فوزي', locationId: 3 },
      { name: 'انور سليم', locationId: 3 },
      { name: 'نعمة جرجس', locationId: 3 },
      { name: 'جميل خلف', locationId: 3 },
      // المنوفية
      { name: 'سامي كامل غالي', locationId: 4 },
      { name: 'هاني كامل عبد المسيح', locationId: 4 },
      { name: 'عبد السيد كامل غالي', locationId: 4 },
      { name: 'فايزة يوسف غالي', locationId: 4 },
      { name: 'مريم فهمي مرقص', locationId: 4 },
      { name: 'نادية بشارة يوسف', locationId: 4 },
      { name: 'فايزة وهبة برسوم', locationId: 4 },
      { name: 'إيهاب فهمي عبد الشهيد', locationId: 4 }
    ]
  })

  console.timeEnd('Seed finished in')
}

main()
