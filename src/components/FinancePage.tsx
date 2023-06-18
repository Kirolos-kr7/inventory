"use client"

import DateSelector from "@/components/DateSelector"
import Loading from "@/components/Loading"
import MonthlyFinance from "@/components/MonthlyFinance"
import PageHeader from "@/components/PageHeader"
import { useDateStore } from "@/utils/store"
import { trpc } from "@/utils/trpc"
import { type FinanceWithSrc } from "@/utils/types"
import { FinanceType } from "@prisma/client"
import { useEffect, useState } from "react"

const FinancePage = ({ type }: { type: FinanceType }) => {
  const { month, year } = useDateStore()
  const [finance, setFinance] = useState<FinanceWithSrc[]>()

  const { data, isLoading, refetch } = trpc.finance.getByMix.useQuery({
    month,
    year,
    type,
  })

  useEffect(() => {
    setFinance(structuredClone(data))
  }, [data])

  const financeChanged = () => {
    let inc: FinanceWithSrc[] = []

    data?.map(({ srcId, price }) => {
      const cahnged = finance?.find((i) => i.srcId == srcId && i.price != price)

      if (cahnged) inc.push(cahnged)
    })

    return inc
  }

  return (
    <>
      <PageHeader
        title={type == "income" ? "الدخل" : "المصاريف"}
        subtitle={<DateSelector />}
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <MonthlyFinance
          type={type}
          finance={finance}
          setFinance={setFinance}
          financeChanged={financeChanged}
          done={refetch}
        />
      )}
    </>
  )
}

export default FinancePage
