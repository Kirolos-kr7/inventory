"use client"

import { fadeIn, slideDown } from "@/utils/motion"
import { useDateStore } from "@/utils/store"
import Edit from "@iconify/icons-mdi/calendar-edit"
import { Icon } from "@iconify/react/dist/offline"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import Button from "./Button"
import DateDialog from "./dialogs/DateDialog"

const DateSelector = () => {
  const { month, year } = useDateStore()
  const [dateEdit, setDateEdit] = useState(false)

  return (
    <>
      <div>
        <div className="flex gap-2 mt-1">
          <p className="text-gray-400 ">
            {month} {year}
          </p>
          <Button className="btn-xs" onClick={() => setDateEdit(true)}>
            <Icon icon={Edit} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {dateEdit && (
          <>
            <motion.div
              variants={slideDown}
              initial="hide"
              animate="show"
              exit="hide"
              className="modal-box fixed top-5 left-1/2 w-[calc(100%-24px)] sm:w-full border border-base-300 shadow-md md:min-w-[480px] z-40 overflow-auto"
            >
              <h3 className="text-2xl font-bold">اختر التاريخ</h3>

              <DateDialog />
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hide"
              animate="show"
              exit="hide"
              className="inset-0 bg-base-100/40 backdrop-blur-[2px] absolute z-[39]"
              onClick={() => setDateEdit(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default DateSelector
