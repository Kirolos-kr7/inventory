import HomeGrid from "@/components/HomeGrid"
import { NextPage } from "next"

const Home: NextPage = () => {
  return (
    <>
      <div className="py-8 text-center">
        <h1 className="text-4xl font-bold">
          جمعية الشهيد كيرياكوس وامه يوليطة
        </h1>
        <h2 className="text-gray-400 mt-3 text-2xl font-semibold">
          القبطية الارثوذكسية
        </h2>
      </div>

      <HomeGrid />
    </>
  )
}

export default Home
