'use client'

import Button from '@/components/button'
import DateSelector from '@/components/dateSelector'
import Loading from '@/components/loading'
import PageHeader from '@/components/pageHeader'
import { downloadCsvFile } from '@/utils/csv'
import { MONTHS, getFinancialYear } from '@/utils/dayjs'
import { handleError } from '@/utils/handleError'
import { useResetDateStore } from '@/utils/helpers'
import { useDateStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import { FinanceChange, FinanceWithSrc } from '@/utils/types'
import Download from '@iconify/icons-mdi/microsoft-excel'
import { Icon } from '@iconify/react/dist/offline'
import { FinanceType } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'
import { NextPage } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import FinanceTable from './financeTable'

const Stats: NextPage = () => {
  const { month, year } = useDateStore()
  const financialYear = getFinancialYear(month, year)

  const [type, setType] = useState<FinanceType>('income')
  const [finance, setFinance] = useState<FinanceWithSrc[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const { data, isLoading, refetch, isRefetching } =
    trpc.finance.getFinanceTableData.useQuery({
      year: financialYear,
      type
    })
  const { data: financeList } = trpc.finance.getFinanceList.useQuery({
    type
  })
  const updateMutation = trpc.finance.updateFinance.useMutation()
  useResetDateStore()

  useEffect(() => {
    const view = params.get('view')
    if (view && (view == 'income' || view == 'expense')) {
      setType(view)
    }
  }, [params])

  useEffect(() => {
    if (data) setFinance(structuredClone(data))
  }, [data])

  useEffect(() => {
    router.replace(`${pathname}?view=${type}`)
  }, [type, router, pathname])

  const changes = useMemo(() => {
    const diff: FinanceChange[] = []

    finance.forEach(({ srcId, month, price }) => {
      const found = data?.find(
        ({ srcId: x, month: y, price: z }) =>
          srcId == x && month == y && price == z
      )

      if (!found)
        diff.push({
          type,
          srcId,
          month,
          year: !MONTHS.slice(0, 6).includes(month)
            ? financialYear.split('-')[0]
            : financialYear.split('-')[1],
          price
        })
    })

    return diff
  }, [finance, data, type, financialYear])

  const update = (sId: number, month: string, price: number) => {
    setFinance((v) => {
      if (
        price == 0 &&
        !data?.find(({ srcId: x, month: y }) => sId == x && month == y)
      ) {
        v = v.filter(({ srcId: x, month: y }) => sId != x || month != y)

        return v
      }

      const found = v.find(({ srcId: x, month: y }) => sId == x && month == y)
      if (!found)
        v.push({
          srcId: sId,
          price,
          month,
          year,
          type,
          src: financeList?.find(({ id }) => id == sId)!
        })
      v = v.map((c) => {
        if (c.srcId == sId && c.month == month) c.price = price
        return c
      })

      return v
    })
  }

  const save = async () => {
    try {
      await updateMutation.mutateAsync(changes)
      refetch()
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <PageHeader
        title="جدول المالية"
        subtitle={<DateSelector onlyYear />}
        actions={
          <div className="flex gap-2 items-center" dir="ltr">
            <div className="dropdown">
              <label
                tabIndex={0}
                className={`btn m-1 btn-sm sm:btn-md ${
                  changes.length > 0 ? 'btn-disabled' : ''
                }`}
              >
                {type == 'income' ? 'الدخل' : 'المصاريف'}
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content compact menu p-2 shadow bg-base-100 rounded-box w-28 sm:w-52"
                dir="rtl"
              >
                <li>
                  <a
                    className={type == 'income' ? 'active' : ''}
                    onClick={() => setType('income')}
                  >
                    الدخل
                  </a>
                  <a
                    className={type == 'expense' ? 'active' : ''}
                    onClick={() => setType('expense')}
                  >
                    المصاريف
                  </a>
                </li>
              </ul>
            </div>

            <Button
              className="p-3 h-auto min-h-fit"
              onClick={() => downloadCsvFile('financeTable')}
            >
              <Icon icon={Download} width={20} />
            </Button>
          </div>
        }
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <>
          <FinanceTable
            data={finance}
            changes={changes}
            financeList={financeList}
            year={financialYear}
            update={update}
          />

          <AnimatePresence>
            {changes.length > 0 && (
              <motion.div
                initial={{ translateY: '500px' }}
                animate={{ translateY: '0px' }}
                exit={{ translateY: '500px' }}
                transition={{
                  type: 'spring',
                  bounce: 0.2,
                  duration: 0.6
                }}
                className="flex gap-2 my-2 fixed left-5 border border-base-300 shadow-lg bottom-3 p-3 bg-base-100 rounded-xl"
              >
                <Button
                  className="btn-sm btn-error"
                  onClick={() =>
                    data?.length && setFinance(structuredClone(data))
                  }
                  disabled={updateMutation.isLoading || isRefetching}
                >
                  الغاء
                </Button>
                <Button
                  className="btn-sm"
                  onClick={save}
                  pending={updateMutation.isLoading || isRefetching}
                >
                  حفظ
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  )
}

export default Stats
