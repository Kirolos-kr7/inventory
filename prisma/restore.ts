import { PrismaClient } from '@prisma/client'
import { readFile, readdir } from 'fs/promises'

const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const main = async () => {
  const MAIN_DIR = './.db'
  const dotDB = await readdir(MAIN_DIR)

  const BASE_PATH = MAIN_DIR + `\\` + dotDB.at(-1)
  const backup = await readdir(BASE_PATH)

  backup.map(async (fileName) => {
    const model = fileName.replace('.json', '')
    const file = await readFile(`${BASE_PATH}/${fileName}`, 'utf8')

    // @ts-ignore
    await db[model].createMany({
      data: eval(file)
    })
  })
}

main().catch((err) => {
  console.log(err)
})
