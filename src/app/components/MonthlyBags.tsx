const MonthlyBags = ({ bags }: { bags: string }) => {
  return (
    <>
      <h3 className="text-2xl font-semibold mb-4">عدد الشنط الشهرية</h3>
      <span className="text-secondary text-3xl font-black">{bags}</span>
    </>
  )
}

export default MonthlyBags
