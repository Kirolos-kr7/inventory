import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import "dayjs/locale/ar"
dayjs.extend(localizedFormat)
dayjs.locale("ar")

export default dayjs
