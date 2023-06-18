import BagProgress from "./BagProgress"
import DoneeGraph from "./DoneeGraph"
import InfoBox from "./InfoBox"

const values = [
  {
    name: "الدخل",
    value: "2200",
  },
  {
    name: "المصاريف",
    value: "1800",
  },
  {
    name: "التموين",
    value: "1250",
  },
]

const HomeGrid = () => {
  return (
    <div className="grid sm:grid-cols-3 gap-3 [&>*]:card [&>*]:bg-base-300/80 [&>*]:p-4">
      {values.map(({ name, value }) => (
        <InfoBox key={name} name={name} value={value} />
      ))}
      <BagProgress />
      <DoneeGraph />
    </div>
  )
}

export default HomeGrid
