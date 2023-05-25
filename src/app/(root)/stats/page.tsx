"use client"

import YearlyTable from "@/components/YearlyTable"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { YEARS } from "@/utils/dayjs"
import { trpc } from "@/utils/trpc"
import { NextPage } from "next"
import { useState } from "react"
import { FinanceType } from "@prisma/client"

const Stats: NextPage = () => {
  const [year, setYear] = useState("23")
  const [type, setType] = useState<FinanceType>("income")

  const { data, isLoading } = trpc.finance.getFinanceTableData.useQuery({
    year,
    type,
  })
  const { data: financeList } = trpc.finance.getFinanceList.useQuery({
    type,
  })

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
