import { Finance, FinanceList, FinanceType, Item, Supply } from '@prisma/client'

export interface ItemWithCount extends Item {
  count: number
}

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

export interface FinanceChange {
  srcId: number
  month: string
  year: string
  price: number
  type: FinanceType
}

export interface ActiveLocation {
  id: number
  name: string
  isActive: boolean
}

export type DoneeFilterType = 'all' | 'did' | 'does' | "didn't"
