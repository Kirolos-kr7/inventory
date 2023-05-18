import { SignJWT } from "jose"

export const genJWT = async (payload: any) => {
  const secret = new TextEncoder().encode(process.env.SECRET_TOKEN)

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret)

  return jwt
}
