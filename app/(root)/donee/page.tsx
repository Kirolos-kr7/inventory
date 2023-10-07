'use client'

import Button from '@/components/button'
import Confirmation from '@/components/confirmation'
import Dialog from '@/components/dialog'
import Loading from '@/components/loading'
import Locations from '@/components/locations'
import PageHeader from '@/components/pageHeader'
import { trpc } from '@/utils/trpc'
import Remove from '@iconify/icons-mdi/delete'
import Edit from '@iconify/icons-mdi/edit'
import { Icon } from '@iconify/react/dist/offline'
import { Donee } from '@prisma/client'
import { NextPage } from 'next'
import { useState } from 'react'
import { CheckmarkIcon, ErrorIcon } from 'react-hot-toast'
import AddDonee from './addDonee'
import UpdateDonee from './updateDonee'

const Users: NextPage = () => {
  const { data, refetch, isLoading, isRefetching } =
    trpc.donee.getAll.useQuery()
  const removeMutation = trpc.donee.remove.useMutation()

  const [activeLocations, setActiveLocations] = useState<
    { id: number; name: string; isActive: boolean }[]
  >([])
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [selectedDonee, setSelectedDonee] = useState<Donee | null>(null)

  const getDonees = () => {
    return data?.filter(({ location }) =>
      activeLocations.find(({ id, isActive }) => location.id == id && isActive)
    )
  }

  return (
    <div>
      <PageHeader
        title="المخدومين"
        actions={
          !isLoading && (
            <div className="flex items-center gap-2">
              <Locations
                active={activeLocations}
                setActive={setActiveLocations}
              />

              <Button
                className="btn-sm sm:btn-md"
                onClick={() => setIsAdding(true)}
              >
                اضافة مخدوم
              </Button>
            </div>
          )
        }
      />

      {isLoading && <Loading />}

      {!isLoading && (
        <div className="overflow-auto max-h-[calc(79lvh)]">
          <table className="table w-full text-right">
            <thead>
              <tr className="[&>*]:first-of-type:rounded-t-none [&>*]:text-base [&>*]:last-of-type:rounded-t-none sticky top-0 shadow-sm z-[12]">
                <th className="w-8"></th>
                <th>الاسم</th>
                <th>المنطقة</th>
                <th>شنطة شهرية</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {getDonees()?.map(({ id, name, location, isRegular }, i, u) => (
                <tr key={id} className="table-sm">
                  <th>{i + 1}</th>
                  <td>{name}</td>
                  <td>{location.name}</td>
                  <td>{isRegular ? <CheckmarkIcon /> : <ErrorIcon />}</td>

                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        className="p-2 text-green-600 rounded-full h-auto min-h-fit btn-ghost"
                        onClick={() => {
                          setIsEditing(true)
                          setSelectedDonee(u[i])
                        }}
                      >
                        <Icon icon={Edit} width={18} />
                      </Button>
                      <Button
                        className="p-2 rounded-full text-error h-auto min-h-fit btn-ghost"
                        onClick={() => {
                          setIsRemoving(true)
                          setSelectedDonee(u[i])
                        }}
                      >
                        <Icon icon={Remove} width={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={isAdding}
        header="مستخدم جديد"
        body={
          <AddDonee
            done={() => {
              refetch()
              setIsAdding(false)
            }}
          />
        }
        close={() => setIsAdding(false)}
      />

      <Dialog
        open={isEditing && selectedDonee != null}
        header="تعديل المخدوم"
        body={
          <UpdateDonee
            donee={selectedDonee}
            done={async () => {
              setIsEditing(false)
              setSelectedDonee(null)
              await refetch()
            }}
          />
        }
        close={async () => {
          setIsEditing(false)
          setSelectedDonee(null)
        }}
      />

      <Dialog
        open={isRemoving && selectedDonee != null}
        header="حذف المخدوم"
        body={
          <Confirmation
            accept={async () => {
              if (!selectedDonee) return

              await removeMutation.mutateAsync(selectedDonee.id)

              await refetch()
              setIsRemoving(false)
              setSelectedDonee(null)
            }}
            cta="حذف"
            message="هل انت متأكد؟"
            pending={removeMutation.isLoading || isRefetching}
          />
        }
        close={() => setIsRemoving(false)}
      />
    </div>
  )
}

export default Users
