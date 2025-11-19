import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password } = await request.json()

    // Validation
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    console.log('Attempting to create user:', { name, username, email, hasPassword: !!hashedPassword })
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      }
    })
    
    console.log('User created successfully:', { id: user.id, email: user.email, username: user.username })

    // Verify user was actually saved
    const verifyUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    
    if (!verifyUser) {
      console.error('CRITICAL: User was created but cannot be found in database!')
      return NextResponse.json(
        { error: 'User creation failed - database verification error' },
        { status: 500 }
      )
    }

    // Return user without password
    const { password: passwordHash, ...userWithoutPassword } = user
    void passwordHash

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // Provide more detailed error messages
    if (error instanceof Error) {
      // Prisma errors
      if (error.message.includes('Unique constraint') || error.message.includes('UNIQUE constraint')) {
        return NextResponse.json(
          { error: 'Email or username already exists' },
          { status: 400 }
        )
      }
      
      // Database connection errors
      if (error.message.includes('connect') || error.message.includes('database') || error.message.includes('P1001')) {
        console.error('Database connection error:', error)
        return NextResponse.json(
          { error: 'Database connection failed. Please check your database configuration.' },
          { status: 500 }
        )
      }
      
      // Column doesn't exist errors
      if (error.message.includes('does not exist') || error.message.includes('P2022')) {
        console.error('Database schema error:', error)
        return NextResponse.json(
          { error: 'Database schema mismatch. Please run migrations.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}