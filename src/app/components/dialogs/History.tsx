"use client"

import { trpc } from "@/utils/trpc"
import dayjs from "@/utils/dayjs"

const History = ({ itemId }: { itemId: number | null }) => {
  const { data } = trpc.transaction.getAll.useQuery(itemId)

  return (
    <ul>
      {data?.map(({ message, id, createdAt }) => {
        const cat = dayjs(createdAt)

        return (
          <li key={id} className="flex items-center gap-3">
            <span className="w-3 h-0.5 bg-secondary" />
            <p>
              <span
                className="tooltip tooltip-left"
                data-tip={cat.format("LLLL")}
              >
                [{cat.format("LT")}]
              </span>{" "}
              {message}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

export default History
