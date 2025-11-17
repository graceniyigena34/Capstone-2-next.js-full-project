export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  createdAt: string
}

export interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  author: User
  tags: Tag[]
  published: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  coverImage?: string
  readTime: number
  likes: number
  comments: Comment[]
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Comment {
  id: string
  content: string
  author: User
  postId: string
  createdAt: string
  parentId?: string
  replies: Comment[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}