"use client"

import { NextPage } from "next"
import PageHeader from "../../components/PageHeader"
import { trpc } from "@/utils/trpc"
import MonthlyBags from "../../components/MonthlyBags"
import Dialog from "../../components/Dialog"
import BagContent from "../../components/dialogs/BagContent"

const Inventory: NextPage = () => {
  const { data, isFetching } = trpc.item.getAll.useQuery()
  const { data: bags } = trpc.meta.get.useQuery("monthlyBags")

  return (
    <div>
      <PageHeader title="الشنطة" subtitle="الشنطة دي فيها اييه!" />

      <div>
        <div className="mb-6">
          <MonthlyBags bags={bags || "0"} />
        </div>

        <div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-semibold">محتويات الشنطة</h3>
            <Dialog
              cta="تعديل"
              header="محتويات الشنطة"
              body={<BagContent items={data} />}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-5">
            {data?.map(({ id, name, perBag }) => (
              <div
                className="bg-base-300 shadow-md gap-10 p-3 flex items-center justify-between"
                key={id}
              >
                <h3 className="text-2xl font-semibold">{name}</h3>
                <span className="text-secondary text-3xl font-black">
                  {perBag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventory
