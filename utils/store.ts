import { User } from '@prisma/client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { currMonth, currYear } from './dayjs'

type Store = {
  user: User | null
  setUser: (user: User | null) => void
  sbOpened: boolean
  toggleSb: (s?: boolean) => void
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set(() => ({ user })),
      sbOpened: false,
      toggleSb: (s) =>
        set((state) => ({
          sbOpened: typeof s == 'boolean' ? s : !state.sbOpened
        }))
    }),
    {
      name: 'store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

type MonthStore = {
  month: string
  setMonth: (v?: string) => void
  year: string
  setYear: (v?: string) => void
}

const useDateStore = create<MonthStore>((set) => ({
  month: currMonth,
  setMonth: (month) => set(() => ({ month })),
  year: currYear,
  setYear: (year) => set(() => ({ year }))
}))

export { useStore, useDateStore }
