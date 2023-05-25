"use client"

import MonthlyExpense from "@/components/MonthlyExpense"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { MONTHS, YEARS, currMonth, currYear } from "@/utils/dayjs"
import { trpc } from "@/utils/trpc"
import { NextPage } from "next"
import { useEffect, useState } from "react"
import { expenseWithSrc } from "@/utils/types"

const Expense: NextPage = () => {
  const [month, setMonth] = useState(currMonth)
  const [year, setYear] = useState(currYear)
  const [expense, setExpense] = useState<expenseWithSrc[]>()

  const { data, isLoading, refetch } = trpc.expense.getByMix.useQuery({
    month,
    year,
  })

  useEffect(() => {
    setExpense(structuredClone(data))
  }, [data])

  const expenseChanged = () => {
    let inc: expenseWithSrc[] = []

    data?.map(({ srcId, price }) => {
      const cahnged = expense?.find((i) => i.srcId == srcId && i.price != price)

      if (cahnged) inc.push(cahnged)
    })

    return inc
  }

  return (
    <>
      <PageHeader
        title="المصاريف"
        subtitle={`${month} ${year}`}
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
                الشهر
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
                dir="rtl"
              >
                {MONTHS.map((n) => (
                  <li key={n}>
                    <a
                      className={n == month ? "active" : ""}
                      onClick={() => setMonth(n)}
                    >
                      {n}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <MonthlyExpense
          expense={expense}
          setExpense={setExpense}
          expenseChanged={expenseChanged}
          done={refetch}
        />
      )}
    </>
  )
}

export default Expense
