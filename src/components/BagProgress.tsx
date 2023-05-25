import Button from "./Button"

const BagProgress = () => {
  return (
    <div className="card col-span-2 bg-base-300/80 p-4">
      <div className="flex justify-between mb-5">
        <h2 className="text-lg font-bold">الشنط الشهرية</h2>

        <span className="stat-value text-secondary"> 31/22 </span>
      </div>

      <progress className="progress progress-secondary" value="22" max="31" />
    </div>
  )
}

export default BagProgress
