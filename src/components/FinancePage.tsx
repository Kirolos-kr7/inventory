"use client"

import MonthlyFinance from "@/components/MonthlyFinance"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { MONTHS, currMonth, currYear } from "@/utils/dayjs"
import { trpc } from "@/utils/trpc"
import { useEffect, useState } from "react"
import { type FinanceWithSrc } from "@/utils/types"
import { FinanceType } from "@prisma/client"
import { yearList } from "@/utils/helpers"

const FinancePage = ({ type }: { type: FinanceType }) => {
  const [month, setMonth] = useState(currMonth)
  const [year, setYear] = useState(currYear)
  const [finance, setFinance] = useState<FinanceWithSrc[]>()

  const { data, isLoading, refetch } = trpc.finance.getByMix.useQuery({
    month,
    year,
    type,
  })

  useEffect(() => {
    setFinance(structuredClone(data))
  }, [data])

  const financeChanged = () => {
    let inc: FinanceWithSrc[] = []

    data?.map(({ srcId, price }) => {
      const cahnged = finance?.find((i) => i.srcId == srcId && i.price != price)

      if (cahnged) inc.push(cahnged)
    })

    return inc
  }

  return (
    <>
      <PageHeader
        title={type == "income" ? "الدخل" : "المصاريف"}
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
              >
                {yearList().map((n) => (
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
        <MonthlyFinance
          type={type}
          finance={finance}
          setFinance={setFinance}
          financeChanged={financeChanged}
          done={refetch}
        />
      )}
    </>
  )
}

export default FinancePage
