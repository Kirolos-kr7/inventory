import { handleError } from "@/utils/handleError"
import { trpc } from "@/utils/trpc"
import { FormEvent, useState } from "react"

const AddItem = ({ done }: { done: () => void }) => {
  const [name, setName] = useState("")
  const mutation = trpc.item.add.useMutation()

  const addItem = async (e: FormEvent) => {
    e.preventDefault()

    try {
      await mutation.mutateAsync({
        name,
        count: 0,
        perBag: 0,
      })

      setName("")
      done()
    } catch (err) {
      handleError(err as any)
    }
  }

  return (
    <>
      <form onSubmit={addItem} className="flex flex-col">
        <label className="label" htmlFor="name">
          اسم العنصر
        </label>
        <input
          type="text"
          name="name"
          placeholder="اكتب هنا"
          className="input bg-base-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="col-span-2 flex justify-end mt-3">
          <button className="btn">حفظ</button>
        </div>
      </form>
    </>
  )
}

export default AddItem
