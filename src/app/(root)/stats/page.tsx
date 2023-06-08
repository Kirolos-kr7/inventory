"use client"

import YearlyTable from "@/components/YearlyTable"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { MONTHS, currFinancialYear, currMonth } from "@/utils/dayjs"
import { trpc } from "@/utils/trpc"
import { NextPage } from "next"
import { useEffect, useState } from "react"
import { FinanceType } from "@prisma/client"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { yearList } from "@/utils/helpers"

const Stats: NextPage = () => {
  const [year, setYear] = useState(() => {
    if (MONTHS.slice(0, 6).includes(currMonth))
      return `${parseInt(currFinancialYear) - 1}-${parseInt(currFinancialYear)}`
    else return currFinancialYear
  })
  const [type, setType] = useState<FinanceType>("income")
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const { data, isLoading } = trpc.finance.getFinanceTableData.useQuery({
    year,
    type,
  })
  const { data: financeList } = trpc.finance.getFinanceList.useQuery({
    type,
  })

  useEffect(() => {
    const view = params.get("view")
    if (view && (view == "income" || view == "expense")) {
      setType(view)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    router.replace(`${pathname}?view=${type}`)
  }, [type, router, pathname])

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
              >
                {yearList(true).map((y) => (
                  <li key={y}>
                    <a
                      className={y == year ? "active" : ""}
                      onClick={() => setYear(y)}
                    >
                      {y}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dropdown">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                {type == "income" ? "الدخل" : "المصاريف"}
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
                dir="rtl"
              >
                <li>
                  <a
                    className={type == "income" ? "active" : ""}
                    onClick={() => setType("income")}
                  >
                    الدخل
                  </a>
                  <a
                    className={type == "expense" ? "active" : ""}
                    onClick={() => setType("expense")}
                  >
                    المصاريف
                  </a>
                </li>
              </ul>
            </div>
          </div>
        }
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <YearlyTable data={data} financeList={financeList} year={year} />
      )}
    </>
  )
}

export default Stats
