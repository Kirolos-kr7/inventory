import { Finance, FinanceList } from "@prisma/client"

export interface FinanceWithSrc extends Finance {
  src: FinanceList
}
