"use client"

import SupplyTable from "@/components/SupplyTable"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { MONTHS, currFinancialYear, currMonth } from "@/utils/dayjs"
import { trpc } from "@/utils/trpc"
import { NextPage } from "next"
import { useState } from "react"
import { yearList } from "@/utils/helpers"

const Stats: NextPage = () => {
  const [year, setYear] = useState(() => {
    if (MONTHS.slice(0, 6).includes(currMonth))
      return `${parseInt(currFinancialYear) - 1}-${parseInt(currFinancialYear)}`
    else return currFinancialYear
  })
  const [showDetails, setShowDetails] = useState(true)

  const { data, isLoading } = trpc.supply.getSupplyTableData.useQuery({
    year,
  })
  const { data: supplyList } = trpc.supply.getSupplyList.useQuery()

  return (
    <>
      <PageHeader
        title="جدول التموين"
        subtitle={`لسنة ${year}`}
        actions={
          <div className="flex gap-2 items-center" dir="ltr">
            <div className="dropdown">
              <label tabIndex={0} className="btn m-1 btn-sm sm:btn-md">
                السنة
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-28 sm:w-52"
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
                عرض التفاصيل
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-28 sm:w-52"
                dir="rtl"
              >
                <li>
                  <a
                    className={showDetails ? "active" : ""}
                    onClick={() => setShowDetails(true)}
                  >
                    عرض
                  </a>
                  <a
                    className={!showDetails ? "active" : ""}
                    onClick={() => setShowDetails(false)}
                  >
                    اخفاء
                  </a>
                </li>
              </ul>
            </div>
          </div>
        }
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <SupplyTable
          data={data}
          supplyList={supplyList}
          year={year}
          showDetails={showDetails}
        />
      )}
    </>
  )
}

export default Stats
