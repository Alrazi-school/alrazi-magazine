import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
  name?: string
  email?: string
  role?: string
  isLoggedIn?: boolean
}

const opts = {
  password: process.env.SESSION_SECRET || 'alrazi-default-secret-key-32-chars-min',
  cookieName: 'alrazi_session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), opts)
}
