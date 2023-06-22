import Button from "@/components/button"
import { handleError } from "@/utils/handleError"
import { trpc } from "@/utils/trpc"
import { FormEvent, useState } from "react"

const AddItem = ({ done, pending }: { done: () => void; pending: boolean }) => {
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
      handleError(err)
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
          id="name"
          placeholder="اكتب هنا"
          className="input bg-base-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="col-span-2 flex justify-end mt-3">
          <Button type="submit" pending={mutation.isLoading || pending}>
            حفظ
          </Button>
        </div>
      </form>
    </>
  )
}

export default AddItem
