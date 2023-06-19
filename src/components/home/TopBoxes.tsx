"use client"

import { useDateStore } from "@/utils/store"
import { trpc } from "@/utils/trpc"
import InfoBox from "./InfoBox"
import Loader from "../Loader"

const TopBoxes = () => {
  const { month, year } = useDateStore()
  const { data: finance, isLoading: fLoading } =
    trpc.finance.getHomeData.useQuery({ month, year })
  const { data: supply, isLoading: sLoading } =
    trpc.supply.getHomeData.useQuery({ month, year })

  return (
    <>
      <InfoBox name="الدخل" value={finance?.income} isLoading={fLoading} />
      <InfoBox name="المصاريف" value={finance?.expense} isLoading={fLoading} />
      <InfoBox name="التموين" value={supply?.supply} isLoading={sLoading} />
    </>
  )
}

export default TopBoxes
