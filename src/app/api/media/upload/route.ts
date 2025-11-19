import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const uploadDir = path.join(process.cwd(), 'public/uploads')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    await mkdir(uploadDir, { recursive: true })

    const fileExtension = path.extname(file.name) || '.png'
    const fileName = `${randomUUID()}${fileExtension}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 })
  } catch (error) {
    console.error('Image upload failed', error)
    return NextResponse.json({ error: 'Unable to upload image' }, { status: 500 })
  }
}

