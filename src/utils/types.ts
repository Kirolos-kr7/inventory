import { Expense, Income, expenseList, incomeList } from "@prisma/client"

export interface incomeWithSrc extends Income {
  src: incomeList
}

export interface expenseWithSrc extends Expense {
  src: expenseList
}

export type dataList = incomeList | expenseList
export type dataWithSrc = incomeWithSrc | expenseWithSrc
