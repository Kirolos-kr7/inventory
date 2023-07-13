'use client'

import Button from '@/components/button'
import DateSelector from '@/components/dateSelector'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { downloadCsvFile } from '@/utils/csv'
import { getFinancialYear } from '@/utils/dayjs'
import { useResetDateStore } from '@/utils/helpers'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import Download from '@iconify/icons-mdi/microsoft-excel'
import { Icon } from '@iconify/react/offline'
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

            <Button
              className="p-3 h-auto min-h-fit"
              onClick={() => downloadCsvFile('supplyTable')}
            >
              <Icon icon={Download} width={20} />
            </Button>
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
