import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let isAuthed = false

  try {
    const token = request.cookies.get('auth')?.value
    if (!token) throw new Error()
    const secret = new TextEncoder().encode(process.env.SECRET_TOKEN)
    await jwtVerify(token, secret)

    isAuthed = true
  } catch (err: any) {
    request.cookies.delete('auth')
  }

  if (isAuthed && request.nextUrl.pathname.startsWith('/auth'))
    return NextResponse.redirect(new URL('/', request.url))

  if (!isAuthed && !request.nextUrl.pathname.startsWith('/auth'))
    return NextResponse.redirect(new URL('/auth', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|cross.svg|site.webmanifest|icons/).*)'
  ]
}
