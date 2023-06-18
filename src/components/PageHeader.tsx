import { ReactNode } from "react"

const PageHeader: React.FC<{
  title: string
  subtitle?: string | ReactNode
  actions?: React.ReactNode
}> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-8 pt-1.5 sm:pt-0 flex justify-between items-start">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-bold text-2xl sm:text-3xl">{title}</h2>
        {typeof subtitle != "string" ? (
          subtitle
        ) : (
          <h3 className="text-neutral-400">{subtitle}</h3>
        )}
      </div>

      {actions}
    </div>
  )
}

export default PageHeader
