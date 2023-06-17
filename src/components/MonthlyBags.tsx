import { useEffect, useState } from "react"
import Button from "./Button"
import { Icon } from "@iconify/react"
import Add from "@iconify/icons-mdi/add"
import Subrtact from "@iconify/icons-mdi/minus"
import { trpc } from "@/utils/trpc"
import { motion } from "framer-motion"
import { fadeIn } from "@/utils/motion"

const MonthlyBags = ({
  bags,
  update,
}: {
  bags: string
  update: () => Promise<void>
}) => {
  const [mbs, setMbs] = useState<number>(0)
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const monthlyBagsMutation = trpc.meta.set.useMutation()

  useEffect(() => {
    setMbs(parseInt(bags))
  }, [bags])

  const save = async () => {
    setPending(true)
    await monthlyBagsMutation.mutateAsync({
      key: "monthlyBags",
      value: String(mbs),
    })

    await update()
    setPending(false)
    setIsEditing(false)
  }

  return (
    <>
      <div className="text-secondary text-3xl font-black h-14">
        {isEditing ? (
          <motion.div
            variants={fadeIn}
            initial="hide"
            animate="show"
            className="flex border border-secondary rounded-md w-min"
          >
            <div className="px-1.5 flex">
              {String(mbs) != bags && (
                <span className="text-base font-medium text-white">*</span>
              )}
              <input
                type="number"
                className="input !p-0 text-3xl !shrink-0 text-center ps-2"
                style={{ width: `${String(mbs).length}.5ch` }}
                value={mbs}
                disabled
                onChange={(e) => {
                  const el = e.target
                  el.style.width = `${el.value.length}ch`
                }}
              />
            </div>
            <div className="flex flex-col">
              <Button
                className="btn rounded-md shrink btn-xs w-full rounded-r-none rounded-b-none"
                onClick={() => mbs < 99 && setMbs((v) => (v += 1))}
              >
                <Icon icon={Add} width={18} />
              </Button>
              <Button
                className="btn rounded-md shrink btn-xs w-full rounded-r-none rounded-t-none"
                onClick={() => mbs > 0 && setMbs((v) => (v -= 1))}
              >
                <Icon icon={Subrtact} width={18} />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.span
            variants={fadeIn}
            initial="hide"
            animate="show"
            className="my-1.5 inline-block"
          >
            {bags}
          </motion.span>
        )}
      </div>
    </>
  )
}

export default MonthlyBags
