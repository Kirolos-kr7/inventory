const InfoBox = ({ name, value }: { name: string; value: string | number }) => {
  return (
    <div className="!flex-row justify-between items-center gap-3 col-span-2 sm:col-span-1">
      <h3 className="text-lg font-semibold">{name}</h3>
      <h4 className="text-secondary text-3xl font-black">{value}</h4>
    </div>
  )
}

export default InfoBox
