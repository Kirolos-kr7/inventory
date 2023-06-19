"use client"

import { MONTHS } from "@/utils/dayjs"
import { yearList } from "@/utils/helpers"
import { useDateStore } from "@/utils/store"

const DateDialog = ({ onlyYear = false }: { onlyYear: boolean }) => {
  const { month, year, setMonth, setYear } = useDateStore()

  return (
    <div className="flex flex-col gap-2 items-center mt-5">
      <div className="flex gap-3 w-full">
        <label className="label">السنة</label>
        <ul className="compact menu w-full max-h-20 gap-2 p-2 shadow bg-base-200 rounded-box">
          {yearList(onlyYear).map(({ name, value }) => (
            <li key={value}>
              <a
                className={`justify-center ${value == year ? "active" : ""}`}
                onClick={() => setYear(value)}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {!onlyYear && (
        <div className="flex gap-3 w-full">
          <label className="label">الشهر</label>
          <ul
            className="compact menu w-full max-h-40 gap-2 p-2 shadow bg-base-200 rounded-box"
            dir="rtl"
          >
            {MONTHS.map((n) => (
              <li key={n}>
                <a
                  className={`justify-center ${n == month ? "active" : ""}`}
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

export default DateDialog
