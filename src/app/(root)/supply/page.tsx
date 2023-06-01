"use client"

import SupplyTable from "@/components/SupplyTable"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import { YEARS } from "@/utils/dayjs"
import { trpc } from "@/utils/trpc"
import { NextPage } from "next"
import { useState } from "react"

const Stats: NextPage = () => {
  const [year, setYear] = useState("23")
  const [showDetails, setShowDetails] = useState(true)

  const { data: data, isLoading } = trpc.supply.getSupplyTableData.useQuery({
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
                عرض التفاصيل
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-52"
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
