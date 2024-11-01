'use client'

import Button from '@/components/button'
import { trpc } from '@/utils/trpc'
import { FormEvent } from 'react'

const DeleteStockEntry = ({
  supplyId,
  done,
  pending
}: {
  supplyId: number | null
  done: () => Promise<void>
  pending?: boolean
}) => {
  const mutation = trpc.supply.delete.useMutation()

  return (
    <>
      <form
        onSubmit={async (e: FormEvent) => {
          e.preventDefault()

          if (!supplyId) return

          await mutation.mutateAsync({ supplyId })
          await done()
        }}
        className="flex flex-col gap-3"
      >
        <p>هل انت متأكد؟ هذه العملية لا يمكن التراجع عنها.</p>

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
