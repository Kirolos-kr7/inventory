import Button from "@/components/Button"
import { trpc } from "@/utils/trpc"
import { incomeWithSrc } from "@/utils/types"
import { SetStateAction, useState } from "react"

const MonthlyIncome = ({
  income,
  setIncome,
  incomeChanged,
  done,
}: {
  income: incomeWithSrc[] | undefined
  setIncome: (value: SetStateAction<incomeWithSrc[] | undefined>) => void
  incomeChanged: () => incomeWithSrc[] | undefined
  done: VoidFunction
}) => {
  const updateMutation = trpc.income.updateIncome.useMutation()
  const [isEditing, setIsEditing] = useState(false)

  const save = async () => {
    const changed = incomeChanged()
    changed && (await updateMutation.mutateAsync(changed))

    done()
    setIsEditing(false)
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-semibold">الدخل الشهري</h3>
        {income && income?.length > 0 && (
          <>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  className="btn-sm btn-error"
                  onClick={() => setIsEditing(false)}
                  disabled={updateMutation.isLoading}
                >
                  الغاء
                </Button>
                <Button
                  className="btn-sm"
                  pending={updateMutation.isLoading}
                  onClick={save}
                >
                  حفظ
                </Button>
              </div>
            ) : (
              <Button className="btn-sm" onClick={() => setIsEditing(true)}>
                تعديل
              </Button>
            )}
          </>
        )}
      </div>

      {
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
          {income?.map(({ price: p, src }) => {
            const price = String(p)

            return (
              <div
                className="bg-base-300/80 shadow-md gap-10 p-3 flex items-center rounded-md justify-between"
                key={src.id}
              >
                <h3 className="text-xl font-semibold">{src.name}</h3>
                <div className="flex items-start">
                  <input
                    type="number"
                    className={`bg-base-300 text-secondary text-3xl font-black self-end`}
                    value={price}
                    style={{ width: `${String(price).length}ch` }}
                    onChange={(e) => {
                      const el = e.target
                      el.style.width = `${el.value.length}ch`
                      setIncome((v) =>
                        v?.map((inc) => {
                          if (src.id == inc.src.id)
                            inc.price = parseFloat(el.value)

                          return inc
                        })
                      )
                    }}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

export default MonthlyIncome
