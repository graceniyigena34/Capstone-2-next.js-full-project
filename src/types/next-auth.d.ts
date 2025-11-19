import { type DefaultSession } from 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id: string
      username?: string | null
    }
  }

  interface User {
    username?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    username?: string | null
  }
}

