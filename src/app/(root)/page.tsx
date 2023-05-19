import { NextPage } from "next"
import PageHeader from "../components/PageHeader"
import Link from "next/link"

const Home: NextPage = () => {
  return (
    <div className="grid place-content-center justify-items-center h-[calc(100vh-14rem)] text-center">
      <h1 className="text-4xl font-bold">جمعية الشهيد كيرياكوس وامه يوليطة</h1>
      <h2 className="text-gray-400 mt-3 text-2xl font-semibold">
        القبطية الارثوذكسية
      </h2>

      <Link href={"/inventory"} className="btn mt-5">
        {" "}
        تفقد المخزون{" "}
      </Link>
    </div>
  )
}

export default Home
