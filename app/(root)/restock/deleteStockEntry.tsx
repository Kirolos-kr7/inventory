'use client'

import Button from '@/components/button'
import { trpc } from '@/utils/trpc'
import { FormEvent, useState } from 'react'

const DeleteStockEntry = ({
  supplyId,
  done,
  pending
}: {
  supplyId: number | null
  done: () => Promise<void>
  pending?: boolean
}) => {
  const [removeStock, setRemoveStock] = useState(false)
  const mutation = trpc.supply.delete.useMutation()

  return (
    <>
      <form
        onSubmit={async (e: FormEvent) => {
          e.preventDefault()

          if (!supplyId) return

          await mutation.mutateAsync({ supplyId, removeStock })
          await done()
        }}
        className="flex flex-col gap-3"
      >
        <p>هل انت متأكد؟ هذه العملية لا يمكن التراجع عنها.</p>

        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            id="removeStock"
            className="checkbox checkbox-sm checkbox-secondary"
            defaultChecked={removeStock}
            onChange={() => setRemoveStock((v) => !v)}
          />
          <label className="label text-sm" htmlFor="removeStock">
            مسح العناصر المدخلة سابقا في هذه العملية
          </label>
        </div>

        <div className="col-span-2 flex justify-end">
          <Button type="submit" pending={pending || mutation.isLoading}>
            مسح
          </Button>
        </div>
      </form>
    </>
  )
}

export default DeleteStockEntry
