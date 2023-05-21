import { useState, FormEvent, useEffect } from "react"
import Button from "../Button"
import { trpc } from "@/utils/trpc"
import { User } from "@prisma/client"
import { handleError } from "@/utils/handleError"
import { useStore } from "@/utils/store"

enum TABS {
  NAME,
  PASSWORD,
}

const UpdateUser = ({
  user,
  done,
}: {
  user: User | null
  done: () => Promise<void>
}) => {
  const [tab, setTab] = useState<TABS>(TABS.NAME)
  const [userData, setUserData] = useState({
    name: "",
    password: "",
    passwordConfirm: "",
  })

  const tabs = [
    { name: "الاسم", value: TABS.NAME },
    { name: "كلمة المرور", value: TABS.PASSWORD },
  ]

  const { user: authedUser, setUser } = useStore()
  const nameMutation = trpc.auth.updateName.useMutation()
  const passwordMutation = trpc.auth.updatePassword.useMutation()

  useEffect(() => {
    setUserData((v) => ({ ...v, name: user?.name || "" }))
  }, [user])

  const save = async (e: FormEvent) => {
    e.preventDefault()

    if (!user || !authedUser) return

    try {
      if (tab == TABS.NAME) {
        const { name } = userData
        await nameMutation.mutateAsync({ id: user.id, name })
        setUser({ ...authedUser, name })
      }

      if (tab == TABS.PASSWORD) {
        const { password, passwordConfirm } = userData
        await passwordMutation.mutateAsync({
          id: user.id,
          password,
          passwordConfirm,
        })
      }
    } catch (err) {
      handleError(err)
    }

    done()
  }

  return (
    <>
      <div className="tabs tabs-boxed">
        {tabs.map(({ name, value }) => (
          <button
            className={`tab transition-colors ${
              tab == value ? "tab-active" : ""
            }`}
            key={name}
            onClick={() => setTab(value)}
          >
            {name}
          </button>
        ))}
      </div>

      <div>
        <form onSubmit={save} className="w-full flex flex-col mt-5 gap-2">
          {tab == TABS.NAME ? (
            <>
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
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <label className="label" htmlFor="password">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  className="input bg-base-200"
                  name="password"
                  autoComplete="new-password"
                  placeholder="اكتب هنا"
                  value={userData?.password}
                  onChange={(e) =>
                    setUserData((v) => ({ ...v, password: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col">
                <label className="label" htmlFor="confirm-password">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  className="input bg-base-200"
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="اكتب هنا"
                  value={userData?.passwordConfirm}
                  onChange={(e) =>
                    setUserData((v) => ({
                      ...v,
                      passwordConfirm: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 mt-1">
            <Button
              className="btn-error"
              disabled={nameMutation.isLoading || passwordMutation.isLoading}
            >
              خروج
            </Button>
            <Button
              type="submit"
              pending={nameMutation.isLoading || passwordMutation.isLoading}
            >
              حفظ
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default UpdateUser
