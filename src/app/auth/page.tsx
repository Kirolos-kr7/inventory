"use client"

import Button from "@/components/Button"
import { handleError } from "@/utils/handleError"
import { useStore } from "@/utils/store"
import { trpc } from "@/utils/trpc"
import { setCookie } from "cookies-next"
import { NextPage } from "next"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Loading from "@/components/Loading"

const loginAnimation = {
  on: {
    opacity: 1,
    scale: 1,
    translateX: "-50%",
    translateY: "-50%",
  },
  off: {
    opacity: 0,
    scale: 0.5,
    translateX: "-50%",
    translateY: "-50%",
  },
}

const Auth: NextPage = () => {
  const router = useRouter()
  const { setUser } = useStore()
  const [done, setDone] = useState(false)

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

      setDone(true)
      setUser(user)
      router.push("/")
    } catch (err: any) {
      handleError(err)
    }
    setPending(false)
  }

  return (
    <div className="min-h-[100lvh]">
      <AnimatePresence>
        {!done && (
          <motion.main
            variants={loginAnimation}
            initial="off"
            animate="on"
            exit="off"
            className="flex flex-col gap-5 bg-base-300/80 rounded-lg w-[calc(100%-24px)] sm:w-[480px] shadow-lg p-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <h1 className="text-2xl font-semibold text-center">تسجيل الدخول</h1>

            <form onSubmit={login} className="flex flex-col  gap-2">
              <div className="flex flex-col">
                <label className="label" htmlFor="name">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  className="input"
                  id="name"
                  placeholder="اكتب هنا"
                  value={userData?.name}
                  onChange={(e) =>
                    setUserData((v) => ({ ...v, name: e.target.value }))
                  }
                  autoFocus
                />
              </div>

              <div className="flex flex-col">
                <label className="label" htmlFor="new-password">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  className="input"
                  id="new-password"
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
          </motion.main>
        )}
      </AnimatePresence>

      {done && <Loading offset={0} />}
    </div>
  )
}

export default Auth
