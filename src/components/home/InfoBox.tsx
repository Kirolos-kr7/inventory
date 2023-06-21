import { ReactElement } from "react"
import { motion } from "framer-motion"
import Loader from "../Loader"
import { slideUp } from "@/utils/motion"

const InfoBox = ({
  name,
  value,
  isLoading,
}: {
  name: string
  value: string | number | ReactElement | undefined
  isLoading: boolean
}) => {
  return (
    <div className="bg-base-300/80 shadow-md p-3 flex rounded-md !flex-row justify-between items-center gap-5 col-span-2 sm:col-span-1 overflow-hidden">
      <h3 className="text-lg font-semibold">{name}</h3>
      {isLoading ? (
        <div className="translate-x-1 translate-y-1 -my-0.5">
          <Loader width={40} />
        </div>
      ) : (
        <motion.h4
          variants={slideUp}
          initial="hide"
          animate="show"
          exit="hide"
          className="text-secondary text-3xl font-black"
        >
          {value || 0}
        </motion.h4>
      )}
    </div>
  )
}

export default InfoBox
