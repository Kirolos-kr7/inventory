import Button from '@/components/button'
import { handleError } from '@/utils/handleError'
import { trpc } from '@/utils/trpc'
import { Donee, ServiceArea } from '@prisma/client'
import { FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

enum TABS {
  INFO,
  PASSWORD
}

const UpdateDonee = ({
  donee,
  locations,
  done
}: {
  donee: Donee | null
  locations: ServiceArea[] | undefined
  done: () => Promise<void>
}) => {
  const updateMutation = trpc.donee.update.useMutation()

  const [doneeData, setDoneeData] = useState({
    name: '',
    location: 1,
    isRegular: true
  })

  const tabs = [
    { name: 'الاسم', value: TABS.INFO },
    { name: 'كلمة المرور', value: TABS.PASSWORD }
  ]

  useEffect(() => {
    setDoneeData((v) => {
      if (!donee) return v

      return {
        name: donee.name,
        location: donee.locationId,
        isRegular: donee.isRegular
      }
    })
  }, [donee])

  const save = async (e: FormEvent) => {
    e.preventDefault()

    if (!donee) return

    try {
      const { name, location, isRegular } = doneeData

      if (
        name != donee.name ||
        location != donee.locationId ||
        donee.isRegular != isRegular
      ) {
        await updateMutation.mutateAsync({ id: donee.id, ...doneeData })
      }

      toast.success('تم الحفظ')
      await done()
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <div>
        <form onSubmit={save} className="w-full flex flex-col mt-5 gap-2">
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
              value={doneeData.location}
              onChange={(e) =>
                setDoneeData((v) => ({
                  ...v,
                  location: parseInt(e.target.value)
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

          <div className="flex gap-2 items-center my-2">
            <label className="label" htmlFor="isRegular">
              شنطة شهرية
            </label>
            <input
              type="checkbox"
              id="isRegular"
              className="toggle toggle-secondary"
              onChange={(e) => {
                setDoneeData((v) => ({ ...v, isRegular: e.target.checked }))
              }}
              checked={doneeData.isRegular}
            />
          </div>

          <div className="flex justify-end mt-3">
            <Button type="submit" pending={updateMutation.isLoading}>
              حفظ
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default UpdateDonee
