import { ReactNode } from "react"

const Button = ({
  className,
  pending,
  type = "button",
  children,
  onClick,
}: {
  className?: string
  pending?: boolean
  type?: "button" | "submit" | "reset"
  children: ReactNode
  onClick?: VoidFunction
}) => {
  return (
    <button
      type={type}
      className={`btn ${className} ${pending && "loading"}`}
      onClick={() => onClick?.()}
    >
      {!pending ? children : <span className="mr-2">جار التحميل</span>}
    </button>
  )
}

export default Button
