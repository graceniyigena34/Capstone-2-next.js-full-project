import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { getCurrentSession } from '@/lib/auth'

const uploadDir = path.join(process.cwd(), 'public/uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

export async function POST(request: Request) {
  const session = await getCurrentSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file extension
    const fileExtension = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json({ error: 'Invalid file extension.' }, { status: 400 })
    }

    await mkdir(uploadDir, { recursive: true })

    const fileName = `${randomUUID()}${fileExtension}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to upload image' }, { status: 500 })
  }
}

