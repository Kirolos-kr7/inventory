"use client"

import DateSelector from "@/components/DateSelector"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import YearlyTable from "@/components/YearlyTable"
import { getFinancialYear } from "@/utils/dayjs"
import { useDateStore } from "@/utils/store"
import { trpc } from "@/utils/trpc"
import { FinanceType } from "@prisma/client"
import { NextPage } from "next"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const Stats: NextPage = () => {
  const { month, year } = useDateStore()
  const financialYear = getFinancialYear(month, year)

  const [type, setType] = useState<FinanceType>("income")
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const { data, isLoading } = trpc.finance.getFinanceTableData.useQuery({
    year: financialYear,
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
  }, [params])

  useEffect(() => {
    router.replace(`${pathname}?view=${type}`)
  }, [type, router, pathname])

  return (
    <>
      <PageHeader
        title="جدول المالية"
        subtitle={<DateSelector onlyYear />}
        actions={
          <div className="flex gap-2 items-center" dir="ltr">
            <div className="dropdown">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                {type == "income" ? "الدخل" : "المصاريف"}
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-28 sm:w-52"
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
        <YearlyTable
          data={data}
          financeList={financeList}
          year={financialYear}
        />
      )}
    </>
  )
}

export default Stats
