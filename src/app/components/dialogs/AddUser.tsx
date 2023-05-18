"use client"

import { handleError } from "@/utils/handleError"
import { trpc } from "@/utils/trpc"
import { FormEvent, useState } from "react"

const AddUser = ({ done }: { done: () => void }) => {
  const [userData, setUserData] = useState({
    name: "",
    password: "",
    passwordConfirm: "",
  })
  const mutation = trpc.auth.add.useMutation()

  const addUser = async (e: FormEvent) => {
    e.preventDefault()

    const { name, password, passwordConfirm } = userData

    try {
      await mutation.mutateAsync({
        name,
        password,
        passwordConfirm,
      })

      setUserData({
        name: "",
        password: "",
        passwordConfirm: "",
      })
      done()
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <form onSubmit={addUser} className="flex flex-col w-full gap-2">
        <div className="flex flex-col">
          <label className="label" htmlFor="name">
            اسم المستخدم
          </label>
          <input
            type="text"
            className="input bg-base-200"
            name="name"
            placeholder="اكتب هنا"
            value={userData?.name}
            onChange={(e) =>
              setUserData((v) => ({ ...v, name: e.target.value }))
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="label" htmlFor="new-password">
            كلمة المرور
          </label>
          <input
            type="password"
            className="input bg-base-200"
            name="new-password"
            autoComplete="new-password"
            placeholder="اكتب هنا"
            value={userData?.password}
            onChange={(e) =>
              setUserData((v) => ({ ...v, password: e.target.value }))
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="label" htmlFor="new-password">
            تأكيد كلمة المرور
          </label>
          <input
            type="password"
            className="input bg-base-200"
            name="new-password"
            autoComplete="new-password"
            placeholder="اكتب هنا"
            value={userData?.passwordConfirm}
            onChange={(e) =>
              setUserData((v) => ({ ...v, passwordConfirm: e.target.value }))
            }
          />
        </div>

        <div className="flex justify-end mt-3">
          <button className="btn">دخول</button>
        </div>
      </form>
    </>
  )
}

export default AddUser
