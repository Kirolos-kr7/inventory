import { inferAsyncReturnType } from "@trpc/server"
import { cookies } from "next/headers"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { jwtVerify } from "jose"
import { User } from "@prisma/client"

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const user = await getUser()

  return {
    req,
    resHeaders,
    user: user,
  }
}

const getUser = async () => {
  try {
    const token: any = cookies().get("auth")?.value
    if (!token) return null

    const secret = new TextEncoder().encode(process.env.SECRET_TOKEN)
    const { payload } = await jwtVerify(token, secret)
    const { id, name, isAdmin } = payload as User

    return { id, name, isAdmin }
  } catch (_) {
    return null
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
