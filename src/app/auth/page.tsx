"use client"

import { handleError } from "@/utils/handleError"
import { trpc } from "@/utils/trpc"
import { setCookie } from "cookies-next"
import { NextPage } from "next"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../components/Button"
import { useStore } from "@/utils/store"

const Auth: NextPage = () => {
  const router = useRouter()
  const { user, setUser } = useStore()

  const loginMutation = trpc.auth.login.useMutation()
  const [userData, setUserData] = useState<{ name: string; password: string }>({
    name: "",
    password: "",
  })
  const [pending, setPending] = useState(false)

  const login = async (e: FormEvent) => {
    e.preventDefault()

    setPending(true)
    try {
      const { token, user } = await loginMutation.mutateAsync(userData)
      setCookie("auth", token, {
        secure: true,
        maxAge: 2 * 60 * 60,
      })

      setUser(user)
      router.push("/")
    } catch (err: any) {
      handleError(err as any)
    }
    setPending(false)
  }

  return (
    <div className="min-h-screen grid place-content-center">
      <main className="flex flex-col gap-5 bg-base-300 rounded-lg w-96 sm:w-[480px] shadow-lg p-4">
        <h1 className="text-2xl font-semibold text-center">تسجيل الدخول</h1>

        <form onSubmit={login} className="flex flex-col  gap-2">
          <div className="flex flex-col">
            <label className="label" htmlFor="name">
              اسم المستخدم
            </label>
            <input
              type="text"
              className="input"
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
              className="input"
              name="new-password"
              placeholder="اكتب هنا"
              value={userData?.password}
              onChange={(e) =>
                setUserData((v) => ({ ...v, password: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end mt-1">
            <Button type="submit" pending={pending}>
              دخول
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Auth
