"use client"

import Button from "@/components/button"
import { handleError } from "@/utils/handleError"
import { trpc } from "@/utils/trpc"
import { ServiceArea } from "@prisma/client"
import { FormEvent, useState } from "react"

const AddDonee = ({
  locations,
  done,
}: {
  locations: ServiceArea[] | undefined
  done: () => void
}) => {
  const [doneeData, setDoneeData] = useState({
    name: "",
    location: 1,
  })
  const mutation = trpc.donee.add.useMutation()

  const addDonee = async (e: FormEvent) => {
    e.preventDefault()

    const { name, location } = doneeData

    try {
      await mutation.mutateAsync({
        name,
        location,
      })

      setDoneeData({
        name: "",
        location: 1,
      })
      done()
    } catch (err: any) {
      handleError(err)
    }
  }

  return (
    <>
      <form onSubmit={addDonee} className="flex flex-col w-full gap-2">
        <div className="flex flex-col">
          <label className="label" htmlFor="name">
            اسم المخدوم
          </label>
          <input
            type="text"
            className="input bg-base-200"
            id="name"
            placeholder="اكتب هنا"
            value={doneeData?.name}
            onChange={(e) =>
              setDoneeData((v) => ({ ...v, name: e.target.value }))
            }
            autoFocus
            autoComplete="false"
          />
        </div>

        <div className="flex flex-col">
          <label className="label" htmlFor="location">
            المنطقة
          </label>
          <select
            className="select w-full bg-base-200"
            id="location"
            onChange={(e) =>
              setDoneeData((v) => ({
                ...v,
                location: parseInt(e.target.value),
              }))
            }
          >
            {locations?.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mt-3">
          <Button type="submit" pending={mutation.isLoading}>
            اضافة
          </Button>
        </div>
      </form>
    </>
  )
}

export default AddDonee
