// import { NextAuthOptions } from 'next-auth'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import { PrismaAdapter } from '@auth/prisma-adapter'
// import { prisma } from '../lib/db'
// import bcrypt from 'bcryptjs'

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma) as any,
//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email }
//         })

//         if (!user) {
//           return null
//         }

//         // In a real app, you'd verify the password hash
//         // For demo purposes, we'll skip password verification
//         return user
//       }
//     })
//   ],
//   session: {
//     strategy: 'jwt'
//   },
//   pages: {
//     signIn: '/login',
//     signUp: '/register'
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id
//       }
//       return token
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string
//       }
//       return session
//     }
//   }
// }