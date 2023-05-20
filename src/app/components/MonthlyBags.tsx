import { useEffect, useState } from "react"
import Button from "./Button"
import { Icon } from "@iconify/react"
import Add from "@iconify/icons-mdi/add"
import Subrtact from "@iconify/icons-mdi/minus"
import { trpc } from "@/utils/trpc"

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
      <div className="flex justify-between">
        <h3 className="text-2xl font-semibold mb-4">عدد الشنط الشهرية</h3>

        {isEditing ? (
          <div className="flex gap-2">
            <Button
              className="btn-sm btn-error"
              onClick={() => setIsEditing(false)}
            >
              الغاء
            </Button>
            <Button className="btn-sm" onClick={save} pending={pending}>
              حفظ
            </Button>
          </div>
        ) : (
          <Button className="btn-sm" onClick={() => setIsEditing(true)}>
            تعديل
          </Button>
        )}
      </div>

      <div className="text-secondary text-3xl font-black">
        {isEditing ? (
          <div className="flex border border-secondary rounded-md w-min">
            <div className="px-2">
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
                className="btn shrink btn-xs w-full rounded-r-none rounded-b-none"
                onClick={() => mbs < 99 && setMbs((v) => (v += 1))}
              >
                <Icon icon={Add} width={18} />
              </Button>
              <Button
                className="btn shrink btn-xs w-full rounded-r-none rounded-t-none"
                onClick={() => mbs > 0 && setMbs((v) => (v -= 1))}
              >
                <Icon icon={Subrtact} width={18} />
              </Button>
            </div>
          </div>
        ) : (
          <span>{bags}</span>
        )}
      </div>
    </>
  )
}

export default MonthlyBags
