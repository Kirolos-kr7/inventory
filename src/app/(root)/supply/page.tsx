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

  const [showDetails, setShowDetails] = useState(false)

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
            <input
              id="details"
              type="checkbox"
              className="toggle toggle-md toggle-secondary"
              checked={showDetails}
              onChange={() => setShowDetails((v) => !v)}
            />
            <label className="label text-sm" htmlFor="details">
              التفاصيل
            </label>
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
