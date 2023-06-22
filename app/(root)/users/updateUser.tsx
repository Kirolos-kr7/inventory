import Button from '@/components/button'
import { handleError } from '@/utils/handleError'
import { useStore } from '@/utils/store'
import { trpc } from '@/utils/trpc'
import { User } from '@prisma/client'
import { FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

enum TABS {
  INFO,
  PASSWORD
}

const UpdateUser = ({
  user,
  done
}: {
  user: User | null
  done: (close?: boolean) => Promise<void>
}) => {
  const { user: authedUser, setUser } = useStore()
  const { data: adminCount } = trpc.auth.getAdminCount.useQuery()
  const nameMutation = trpc.auth.updateInfo.useMutation()
  const passwordMutation = trpc.auth.updatePassword.useMutation()
  const cannotChangeAdmin = user?.isAdmin && adminCount! <= 1

  const [tab, setTab] = useState<TABS>(TABS.INFO)
  const [userData, setUserData] = useState({
    name: '',
    password: '',
    passwordConfirm: '',
    isAdmin: false
  })

  const tabs = [
    { name: 'الاسم', value: TABS.INFO },
    { name: 'كلمة المرور', value: TABS.PASSWORD }
  ]

  useEffect(() => {
    setUserData((v) => ({
      ...v,
      name: user?.name || '',
      isAdmin: user?.isAdmin!
    }))
  }, [user])

  const save = async (e: FormEvent) => {
    e.preventDefault()

    if (!user || !authedUser) return

    try {
      if (tab == TABS.INFO) {
        const { name, isAdmin } = userData

        if (name != user.name || isAdmin != user.isAdmin) {
          await nameMutation.mutateAsync({ id: user.id, name, isAdmin })
          if (authedUser.id == user.id)
            setUser({ ...authedUser, name, isAdmin })

          done()
        }

        toast.success('تم الحفظ')
      }

      if (tab == TABS.PASSWORD) {
        const { password, passwordConfirm } = userData
        await passwordMutation.mutateAsync({
          id: user.id,
          password,
          passwordConfirm
        })

        toast.success('تم الحفظ')
        done()
      }
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <div className="tabs tabs-boxed">
        {tabs.map(({ name, value }) => (
          <button
            className={`tab transition-colors ${
              tab == value ? 'tab-active' : ''
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
          {tab == TABS.INFO && (
            <>
              <div className="flex flex-col">
                <label className="label" htmlFor="name">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  className="input bg-base-200"
                  id="name"
                  placeholder="اكتب هنا"
                  value={userData?.name}
                  onChange={(e) =>
                    setUserData((v) => ({ ...v, name: e.target.value }))
                  }
                  autoFocus
                />
              </div>

              <div className="flex gap-2 items-center my-2">
                <label className="label" htmlFor="admin">
                  ادمن
                </label>
                {typeof adminCount == 'number' && (
                  <input
                    type="checkbox"
                    id="admin"
                    className={`toggle toggle-secondary ${
                      cannotChangeAdmin
                        ? 'tooltip tooltip-open tooltip-right'
                        : ''
                    }`}
                    data-tip={
                      cannotChangeAdmin && 'غير مسموح بوجود اقل من 1 ادمن'
                    }
                    disabled={cannotChangeAdmin || !authedUser?.isAdmin}
                    onChange={(e) => {
                      setUserData((v) => ({ ...v, isAdmin: e.target.checked }))
                    }}
                    defaultChecked={user?.isAdmin}
                    value={userData.isAdmin ? 'on' : 'off'}
                  />
                )}
              </div>
            </>
          )}

          {tab == TABS.PASSWORD && (
            <>
              <div className="flex flex-col">
                <label className="label" htmlFor="password">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  className="input bg-base-200"
                  id="password"
                  autoComplete="new-password"
                  placeholder="اكتب هنا"
                  value={userData?.password}
                  onChange={(e) =>
                    setUserData((v) => ({ ...v, password: e.target.value }))
                  }
                  autoFocus
                />
              </div>

              <div className="flex flex-col">
                <label className="label" htmlFor="confirm-password">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  className="input bg-base-200"
                  id="confirm-password"
                  autoComplete="new-password"
                  placeholder="اكتب هنا"
                  value={userData?.passwordConfirm}
                  onChange={(e) =>
                    setUserData((v) => ({
                      ...v,
                      passwordConfirm: e.target.value
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
              onClick={() => done(true)}
            >
              خروج
            </Button>

            {tab == TABS.INFO && (
              <Button
                disabled={
                  (userData.name.trim() == '' ||
                    userData.name.trim() == user?.name) &&
                  userData.isAdmin == user?.isAdmin
                }
                type="submit"
                pending={nameMutation.isLoading || passwordMutation.isLoading}
              >
                حفظ
              </Button>
            )}

            {tab == TABS.PASSWORD && (
              <Button
                disabled={
                  userData.password.trim() == '' ||
                  userData.passwordConfirm.trim() == ''
                }
                type="submit"
                pending={nameMutation.isLoading || passwordMutation.isLoading}
              >
                تغيير
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  )
}

export default UpdateUser
