import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username,
          image: user.image,
          username: user.username,
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as { username?: string }).username ?? null
      }

      if (!token.username && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { username: true, name: true, image: true },
        })

        if (dbUser) {
          token.username = dbUser.username
          token.name = dbUser.name ?? token.name
          token.picture = dbUser.image ?? token.picture
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = (token.username as string | undefined) ?? null
      }

      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export function getCurrentSession() {
  return getServerSession(authOptions)
}
// import NextAuth from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import { prisma } from "./db"
// import bcrypt from "bcryptjs"

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: {},
//         password: {},
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         })

//         if (!user) return null

//         const isValid = await bcrypt.compare(credentials.password, user.password)
//         if (!isValid) return null

//         return user
//       },
//     }),
//   ],
//   session: { strategy: "jwt" },
//   pages: {
//     signIn: "/login",
//   },
// }

// export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
