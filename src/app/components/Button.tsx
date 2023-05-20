import { ReactNode } from "react"

const Button = ({
  className,
  pending,
  disabled,
  type = "button",
  children,
  onClick,
}: {
  className?: string
  pending?: boolean
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  children: ReactNode
  onClick?: VoidFunction
}) => {
  return (
    <button
      type={type}
      className={`btn ${className} ${pending && "loading"} ${
        disabled && "btn-disabled"
      }`}
      onClick={() => onClick?.()}
    >
      {!pending ? children : <span className="mr-2">جار التحميل</span>}
    </button>
  )
}

export default Button
