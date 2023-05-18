const Dialog = ({
  open,
  header,
  body,
  close,
}: {
  open: boolean
  header: string
  body: React.ReactElement
  close?: () => void
}) => {
  return (
    <>
      {open && (
        <div className="fixed grid place-content-center inset-0 z-40">
          <div className="modal-box relative w-full z-10 shadow-md md:min-w-[480px]">
            <h3 className="text-2xl font-bold">{header}</h3>
            <div className="pt-4">{body}</div>
          </div>

          <div
            className="inset-0 bg-base-100/40 backdrop-blur-[1px] z-0 absolute"
            onClick={close}
          />
        </div>
      )}
    </>
  )
}

export default Dialog
