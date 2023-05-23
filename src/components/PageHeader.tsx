const PageHeader: React.FC<{
  title: string
  subtitle?: string
  actions?: React.ReactNode
}> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-8 flex justify-between">
      <div className="flex flex-col gap-0.5 ms-12 sm:ms-0">
        <h2 className="font-bold text-3xl">{title}</h2>
        <h3 className="text-neutral-400">{subtitle}</h3>
      </div>

      {actions}
    </div>
  )
}

export default PageHeader
