"use client"

import { useDateStore } from "@/utils/store"
import { trpc } from "@/utils/trpc"
import InfoBox from "./InfoBox"

const TopBoxes = () => {
  const { month, year } = useDateStore()
  const { data: xData, isLoading: xLoading } =
    trpc.finance.getHomeData.useQuery({ month, year })
  const { data: yData, isLoading: yLoading } = trpc.supply.getHomeData.useQuery(
    { month, year }
  )

  return (
    <>
      <InfoBox name="الدخل" value={xLoading ? "..." : xData?.income || 0} />
      <InfoBox name="المصاريف" value={xLoading ? "..." : xData?.expense || 0} />
      <InfoBox name="التموين" value={xLoading ? "..." : yData?.supply || 0} />
    </>
  )
}

export default TopBoxes
