import { PrismaClient } from '@prisma/client'
import { readFile, readdir } from 'fs/promises'

const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const BACKUP_TS = 1690016471257
const BASE_PATH = `./.db/${BACKUP_TS}`

const main = async () => {
  const dir = await readdir(BASE_PATH)

  dir.map(async (fileName) => {
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
