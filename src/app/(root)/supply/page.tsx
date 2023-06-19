"use client"

import DateSelector from "@/components/DateSelector"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import SupplyTable from "@/components/SupplyTable"
import { getFinancialYear } from "@/utils/dayjs"
import { useDateStore } from "@/utils/store"
import { trpc } from "@/utils/trpc"
import { NextPage } from "next"
import { useState } from "react"

const Stats: NextPage = () => {
  const { month, year } = useDateStore()
  const financialYear = getFinancialYear(month, year)

  const [showDetails, setShowDetails] = useState(true)

  const { data, isLoading } = trpc.supply.getSupplyTableData.useQuery({
    year: financialYear,
  })
  const { data: supplyList } = trpc.supply.getSupplyList.useQuery()

  return (
    <>
      <PageHeader
        title="جدول التموين"
        subtitle={<DateSelector onlyYear />}
        actions={
          <div className="flex gap-2 items-center" dir="ltr">
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
          year={financialYear}
          showDetails={showDetails}
        />
      )}
    </>
  )
}

export default Stats
