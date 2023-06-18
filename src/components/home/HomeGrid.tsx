import BagProgress from "./BagProgress"
import TopBoxes from "./TopBoxes"

const HomeGrid = () => {
  return (
    <div className="grid sm:grid-cols-3 gap-3 [&>*]:card [&>*]:bg-base-300/80 [&>*]:p-4">
      <TopBoxes />
      <BagProgress />
      {/* <DoneeGraph /> */}
    </div>
  )
}

export default HomeGrid
