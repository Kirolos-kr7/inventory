"use client"

import { NextPage } from "next"
import PageHeader from "../../components/PageHeader"
import { trpc } from "@/utils/trpc"
import MonthlyBags from "../../components/MonthlyBags"
import Dialog from "../../components/Dialog"
import BagContent from "../../components/dialogs/BagContent"
import { useState } from "react"
import Loading from "@/app/components/Loading"
import Button from "@/app/components/Button"

const Inventory: NextPage = () => {
  const { data, refetch, isLoading, isRefetching } = trpc.item.getAll.useQuery()
  const {
    data: bags,
    refetch: refetchMbs,
    isRefetching: refetchingMbs,
  } = trpc.meta.get.useQuery("monthlyBags")
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <PageHeader title="الشنطة" subtitle="الشنطة دي فيها اييه!" />

      {isLoading && <Loading />}

      {!isLoading && (
        <div>
          <div className="mb-6">
            <MonthlyBags
              bags={bags || "0"}
              update={() => refetchMbs() as Promise<any>}
            />
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-semibold">محتويات الشنطة</h3>
              {data && data?.length > 0 && (
                <Button className="btn-sm" onClick={() => setIsOpen(true)}>
                  تعديل
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
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
      )}

      <Dialog
        open={isOpen}
        header="محتويات الشنطة"
        body={
          <BagContent
            items={data}
            done={async (isChanged: boolean) => {
              isChanged && (await refetch())
              setIsOpen(false)
            }}
          />
        }
        close={() => setIsOpen(false)}
      />
    </div>
  )
}

export default Inventory
