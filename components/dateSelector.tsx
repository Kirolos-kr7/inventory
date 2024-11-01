'use client'

import { MONTHS } from '@/utils/dayjs'
import { yearList } from '@/utils/helpers'
import { fadeIn, slideDown } from '@/utils/motion'
import { useDateStore } from '@/utils/store'
import ChevronLeft from '@iconify/icons-mdi/chevron-left'
import ChevronRight from '@iconify/icons-mdi/chevron-right'
import { Icon } from '@iconify/react/dist/offline.js'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Button from './button'

const DateSelector = ({ onlyYear = false }: { onlyYear?: boolean }) => {
  const { month, year, setMonth, setYear } = useDateStore()
  const [dateEdit, setDateEdit] = useState(false)

  const SetPrevMonth = () => {
    if (month == MONTHS[0]) {
      setMonth(MONTHS[MONTHS.length - 1])
      setYear(String(+year - 1))

      return
    }

    setMonth(MONTHS[MONTHS.indexOf(month) - 1])
  }

  const SetNextMonth = () => {
    if (month == MONTHS[MONTHS.length - 1]) {
      setMonth(MONTHS[0])
      setYear(String(+year + 1))

      return
    }

    setMonth(MONTHS[MONTHS.indexOf(month) + 1])
  }

  return (
    <>
      <div>
        <div className="flex gap-1.5 mt-1">
          <Button
            className="btn-xs size-6 p-0.5"
            onClick={() => SetPrevMonth()}
          >
            <Icon icon={ChevronRight} width={18} />
          </Button>
          <Button
            className="btn-xs size-6 p-0.5"
            onClick={() => SetNextMonth()}
          >
            <Icon icon={ChevronLeft} width={18} />
          </Button>
          <Button className="btn-xs" onClick={() => setDateEdit(true)}>
            {onlyYear && `لسنة ${year}-${parseInt(year) + 1}`}
            {!onlyYear && `${month} ${year}`}
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

              <DateDialog onlyYear={onlyYear} />
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

const DateDialog = ({ onlyYear = false }: { onlyYear: boolean }) => {
  const { month, year, setMonth, setYear } = useDateStore()

  return (
    <div className="flex flex-col gap-2 items-center mt-5">
      <div className="flex gap-3 w-full">
        <label className="label">السنة</label>
        <ul className="sm menu w-full max-h-20 gap-2 p-2 shadow bg-base-200 rounded-box">
          {yearList().map((v) => (
            <li key={`${v}`}>
              <a
                className={`justify-center ${`${v}` == year ? 'active' : ''}`}
                onClick={() => setYear(`${v}`)}
              >
                {onlyYear ? `${v + 1}-${v}` : v}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {!onlyYear && (
        <div className="flex gap-3 w-full">
          <label className="label">الشهر</label>
          <ul
            className="sm menu grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full gap-2 p-2 shadow bg-base-200 rounded-box"
            dir="rtl"
          >
            {MONTHS.map((n) => (
              <li key={n}>
                <a
                  className={`justify-center ${n == month ? 'active' : ''}`}
                  onClick={() => setMonth(n)}
                >
                  {n}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default DateSelector
