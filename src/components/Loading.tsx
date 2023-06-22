import Loader from "./loader"

const Loading = ({ offset = 150 }: { offset?: number }) => {
  return (
    <div
      className={`w-full grid place-content-center`}
      style={{ height: `calc(100lvh - ${offset}px)` }}
    >
      <Loader />
    </div>
  )
}

export default Loading
