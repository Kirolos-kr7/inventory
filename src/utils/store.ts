import { User } from "@prisma/client"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

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
          sbOpened: typeof s == "boolean" ? s : !state.sbOpened,
        })),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export { useStore }
