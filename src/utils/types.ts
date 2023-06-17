import { Finance, FinanceList, Supply } from "@prisma/client"

export interface FinanceWithSrc extends Finance {
  src: FinanceList
}

export interface SupplyItem {
  id: number
  name: string
}

export interface SupplyWithSrc extends Supply {
  src: SupplyItem
}

export interface CheckoutChange {
  doneeId: number
  itemId: number
  amount: number
  diff: number
}
