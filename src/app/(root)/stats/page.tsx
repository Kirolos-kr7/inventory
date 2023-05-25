"use client"

import YearlyTable from "@/components/YearlyTable"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { YEARS } from "@/utils/dayjs"
import { trpc } from "@/utils/trpc"
import { NextPage } from "next"
import { useState } from "react"

const Stats: NextPage = () => {
  const [year, setYear] = useState("23")
  const [type, setType] = useState<"الدخل" | "المصاريف">("الدخل")

  const { data: income, isLoading: isLoadingIncome } =
    trpc.income.getIncomeTableData.useQuery({
      year,
    })
  const { data: incomeList } = trpc.income.getIncomeList.useQuery()

  const { data: expense, isLoading: isLoadingExpense } =
    trpc.expense.getExpenseTableData.useQuery({
      year,
    })
  const { data: expenseList } = trpc.expense.getExpenseList.useQuery()

  return (
    <>
      <PageHeader
        title="الجدول السنوي"
        subtitle={`لسنة ${year}`}
        actions={
          <div className="flex gap-2 items-center" dir="ltr">
            <div className="dropdown">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                السنة
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
                dir="rtl"
              >
                {YEARS.map((n) => (
                  <li key={n}>
                    <a
                      className={n == year ? "active" : ""}
                      onClick={() => setYear(n)}
                    >
                      {n}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dropdown">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                {type}
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
                dir="rtl"
              >
                <li>
                  <a
                    className={type == "الدخل" ? "active" : ""}
                    onClick={() => setType("الدخل")}
                  >
                    الدخل
                  </a>
                  <a
                    className={type == "المصاريف" ? "active" : ""}
                    onClick={() => setType("المصاريف")}
                  >
                    المصاريف
                  </a>
                </li>
              </ul>
            </div>
          </div>
        }
      />

      {(isLoadingIncome || isLoadingExpense) && <Loading />}

      {!(isLoadingIncome && isLoadingExpense) && (
        <YearlyTable
          data={type == "الدخل" ? income : expense}
          dataList={type == "الدخل" ? incomeList : expenseList}
          year={year}
        />
      )}
    </>
  )
}

export default Stats
