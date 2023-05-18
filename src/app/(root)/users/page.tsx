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

const Inventory: NextPage = () => {
  const { data, refetch } = trpc.auth.getAll.useQuery()

  const [isAdding, setisAdding] = useState(true)

  return (
    <div>
      <div className="flex justify-between items-start">
        <PageHeader title="المستخدمين" />

        <button className="btn" onClick={() => setisAdding(true)}>
          اضافة مستخدم{" "}
        </button>
      </div>

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
            {data?.map(({ id, name, createdAt }, i) => (
              <tr key={id}>
                <th>{i + 1}</th>
                <td>{name}</td>
                <td>{dayjs(createdAt).format("LLLL")}</td>
                <td>
                  <div className="flex items-center gap-1 justify-end">
                    <button className="btn p-2 text-green-600 rounded-full h-auto min-h-fit btn-ghost">
                      <Icon icon={Edit} width={18} />
                    </button>
                    <button className="btn p-2 rounded-full text-error h-auto min-h-fit btn-ghost">
                      <Icon icon={Remove} width={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isAdding}
        header="مستخدم جديد"
        body={
          <AddUser
            done={() => {
              refetch()
              setisAdding(false)
            }}
          />
        }
        close={() => setisAdding(false)}
      />
    </div>
  )
}

export default Inventory
