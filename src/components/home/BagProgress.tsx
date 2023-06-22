"use client"

import { currMonth, currYear } from "@/utils/dayjs"
import { trpc } from "@/utils/trpc"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Loading from "../Loading"
import { useDateStore } from "@/utils/store"

const BagProgress = () => {
  const { month, year } = useDateStore()

  const { data, isLoading, isRefetching } = trpc.checkout.progress.useQuery({
    month,
    year,
  })

  const [progress, setProgress] =
    useState<{ progress: number; from: number; id: number; name: string }[]>()
  const [max, setMax] = useState(0)
  const [curr, setCurr] = useState(0)

  useEffect(() => {
    if (data) {
      setMax(0)
      setCurr(0)

      setProgress(() => {
        let locations = data.locations.map((v) => ({
          ...v,
          progress: 0,
          from: 0,
        }))

        data.progress.forEach(({ location, value }) => {
          setMax((v) => (v += 1))
          if (value) setCurr((v) => (v += 1))

          locations = locations.map((lcn) => {
            if (location == lcn.id) {
              if (value) lcn.progress += 1
              lcn.from += 1
            }

            return lcn
          })
        })

        return locations
      })
    }
  }, [data])

  return (
    <section className="col-span-2">
      <div className="flex justify-between mb-5">
        <h2 className="text-lg font-bold">الشنط الشهرية</h2>

        {!isLoading && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="stat-value text-secondary"
          >
            {max}/{curr}
          </motion.span>
        )}
      </div>

      {isLoading && <Loading offset={480} />}

      {!isLoading && (
        <div className="flex flex-col gap-2">
          {progress?.map(({ id, name, from, progress }, i: number) => (
            <motion.div
              initial={{ opacity: 0, translateX: "50px" }}
              animate={{ opacity: 1, translateX: "0px" }}
              transition={{ delay: i * 0.2 }}
              key={id}
            >
              <label className="label -mb-2 text-gray-300 flex items-center justify-between">
                <span>{name}</span>
                <span className="text-secondary">
                  {progress} / {from}
                </span>
              </label>
              <progress
                className="progress progress-secondary"
                max={from}
                value={progress}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

export default BagProgress
