'use client'

import DateSelector from '@/components/dateSelector'
import DownloadCsv from '@/components/downloadCsv'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { getFinancialYear } from '@/utils/dayjs'
import { useResetDateStore } from '@/utils/helpers'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import { NextPage } from 'next'
import { useState } from 'react'
import SupplyTable from './supplyTable'

const Stats: NextPage = () => {
  const { month, year } = useDateStore()
  const financialYear = getFinancialYear(month, year)

  const [showDetails, setShowDetails] = useState(false)

  const { data, isLoading } = trpc.supply.getSupplyTableData.useQuery({
    year: financialYear
  })
  const { data: supplyList } = trpc.supply.getSupplyList.useQuery()
  useResetDateStore()

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

            {!isLoading && (
              <DownloadCsv
                fileName={`جدول التموين ${financialYear}-${
                  parseInt(financialYear) + 1
                }`}
              />
            )}
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
