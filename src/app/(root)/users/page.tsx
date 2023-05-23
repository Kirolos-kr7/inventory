"use client"

import Button from "@/components/Button"
import Dialog from "@/components/Dialog"
import Loading from "@/components/Loading"
import PageHeader from "@/components/PageHeader"
import AddUser from "@/components/dialogs/AddUser"
import Confirmation from "@/components/dialogs/Confirmation"
import UpdateUser from "@/components/dialogs/UpdateUser"
import dayjs from "@/utils/dayjs"
import { useStore } from "@/utils/store"
import { trpc } from "@/utils/trpc"
import Remove from "@iconify/icons-mdi/delete"
import Edit from "@iconify/icons-mdi/edit"
import { Icon } from "@iconify/react/dist/offline"
import { User } from "@prisma/client"
import { NextPage } from "next"
import { useState } from "react"
import { CheckmarkIcon, ErrorIcon } from "react-hot-toast"

const Users: NextPage = () => {
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
          <table className="table w-full text-right">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>الاسم</th>
                <th>منذ</th>
                <th>ادمن</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.map(({ id, name, createdAt, isAdmin }, i, u) => {
                const disabled = user?.id !== id && !user?.isAdmin

                return (
                  <tr key={id}>
                    <th>{i + 1}</th>
                    <td>{name}</td>
                    <td>{dayjs(createdAt).format("LL")}</td>
                    <td>{isAdmin ? <CheckmarkIcon /> : <ErrorIcon />}</td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          className="p-2 text-green-600 rounded-full h-auto min-h-fit btn-ghost"
                          disabled={disabled}
                          onClick={() => {
                            setIsEditing(true)
                            setSelectedUser(u[i])
                          }}
                        >
                          <Icon icon={Edit} width={18} />
                        </Button>
                        <Button
                          className="p-2 rounded-full text-error h-auto min-h-fit btn-ghost"
                          disabled={disabled}
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
                )
              })}
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
            done={async (close = false) => {
              await refetch()
              if (close) {
                setIsEditing(false)
                setSelectedUser(null)
              } else {
                setSelectedUser((v) => {
                  const u = data?.find(({ id }: { id: number }) => v?.id == id)
                  if (u) return u
                  return null
                })
              }
            }}
          />
        }
        close={async () => {
          await refetch()
          setIsEditing(false)
          setSelectedUser(null)
        }}
      />
    </div>
  )
}

export default Users
