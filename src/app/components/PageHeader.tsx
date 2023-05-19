import { Icon } from "@iconify/react"
import Menu from "@iconify/icons-mdi/menu"
import Button from "./Button"
import { useStore } from "@/utils/store"

const PageHeader: React.FC<{
  title: string
  subtitle?: string
  actions?: React.ReactNode
}> = ({ title, subtitle, actions }) => {
  const { toggleSb } = useStore()

  return (
    <div className="mb-8 flex justify-between">
      <div className="flex gap-0.5 items-center">
        <Button
          className="btn-ghost btn-sm !px-2 sm:hidden block"
          onClick={toggleSb}
        >
          <Icon icon={Menu} width={28} />
        </Button>

        <div>
          <h2 className="font-bold text-3xl">{title}</h2>
          <h3 className="text-neutral-400">{subtitle}</h3>
        </div>
      </div>

      {actions}
    </div>
  )
}

export default PageHeader
