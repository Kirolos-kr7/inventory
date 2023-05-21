import { toast } from "react-hot-toast"

export const handleError = (err: { name: string; message: string } | any) => {
  const { name, message } = err
  let errMessage = ""

  if (name == "TRPCClientError" && isJSON(message))
    errMessage = JSON.parse(message)[0].message
  else errMessage = message

  toast.error(errMessage)
  return errMessage
}

const isJSON = (val: string) => {
  try {
    JSON.parse(val)
    return true
  } catch (err: any) {
    return false
  }
}
