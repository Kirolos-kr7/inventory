"use client"

import { NextPage } from "next"
import PageHeader from "../../components/PageHeader"
import { trpc } from "@/utils/trpc"
import dayjs from "@/utils/dayjs"
import { Icon } from "@iconify/react/dist/offline"
import Remove from "@iconify/icons-mdi/delete"
import Edit from "@iconify/icons-mdi/edit"
import Dialog from "@/app/components/Dialog"
import { useState } from "react"
import AddUser from "@/app/components/dialogs/AddUser"
import Loading from "@/app/components/Loading"
import Confirmation from "@/app/components/dialogs/Confirmation"
import Button from "@/app/components/Button"
import UpdateUser from "@/app/components/dialogs/UpdateUser"
import { User } from "@prisma/client"
import { useStore } from "@/utils/store"

const Inventory: NextPage = () => {
  const { data, refetch, isLoading, isRefetching } = trpc.auth.getAll.useQuery()
  const removeMutation = trpc.auth.remove.useMutation()
  const { user } = useStore()

  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const [isRemoving, setIsRemoving] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <div>
      <div className="flex justify-between items-start">
        <PageHeader title="المستخدمين" />

        {!isLoading && (
          <button className="btn" onClick={() => setIsAdding(true)}>
            اضافة مستخدم
          </button>
        )}
      </div>

      {isLoading && <Loading />}

      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>الاسم</th>
                <th>منذ</th>
                <th>العمليات</th>
              </tr>
            </thead>
            <tbody>
              {data?.map(({ id, name, createdAt }, i, u) => (
                <tr key={id}>
                  <th>{i + 1}</th>
                  <td>{name}</td>
                  <td>{dayjs(createdAt).format("LLLL")}</td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        className="p-2 text-green-600 rounded-full h-auto min-h-fit btn-ghost"
                        disabled={user?.id !== id}
                        onClick={() => {
                          setIsEditing(true)
                          setSelectedUser(u[i])
                        }}
                      >
                        <Icon icon={Edit} width={18} />
                      </Button>
                      <Button
                        className="p-2 rounded-full text-error h-auto min-h-fit btn-ghost"
                        disabled={data.length <= 1}
                        onClick={() => {
                          setIsRemoving(true)
                          setSelectedUser(u[i])
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
          <AddUser
            done={() => {
              refetch()
              setIsAdding(false)
            }}
          />
        }
        close={() => setIsAdding(false)}
      />

      <Dialog
        open={isRemoving && selectedUser != null}
        header="حذف المستخدم"
        body={
          <Confirmation
            accept={async () => {
              if (!selectedUser) return

              await removeMutation.mutateAsync(selectedUser.id)

              await refetch()
              setIsRemoving(false)
              setSelectedUser(null)
            }}
            cta="حذف"
            message="هل انت متأكد؟"
            pending={removeMutation.isLoading || isRefetching}
          />
        }
        close={() => setIsRemoving(false)}
      />

      <Dialog
        open={isEditing && selectedUser != null}
        header="تعديل المستخدم"
        body={
          <UpdateUser
            user={selectedUser}
            done={async () => {
              await refetch()
              setIsEditing(false)
              setSelectedUser(null)
            }}
          />
        }
        close={() => setIsEditing(false)}
      />
    </div>
  )
}

export default Inventory
