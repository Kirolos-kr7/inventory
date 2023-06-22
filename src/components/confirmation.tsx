import { FormEvent } from "react"
import Button from "./button"

const Confirmation = ({
  cta,
  message,
  accept,
  pending,
}: {
  cta: string
  message: string
  accept: () => void
  pending: boolean
}) => {
  return (
    <>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          accept()
        }}
        className="flex flex-col gap-3"
      >
        <p>{message}</p>

        <div className="col-span-2 flex justify-end">
          <Button type="submit" pending={pending}>
            {cta}
          </Button>
        </div>
      </form>
    </>
  )
}

export default Confirmation
