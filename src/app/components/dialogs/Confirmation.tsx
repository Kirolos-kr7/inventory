import { FormEvent } from "react"

const Confirmation = ({
  cta,
  message,
  accept,
}: {
  cta: string
  message: string
  accept: () => void
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
          <button className="btn mt-1">{cta}</button>
        </div>
      </form>
    </>
  )
}

export default Confirmation
