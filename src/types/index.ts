export interface User {
  id: string
  email?: string
  name?: string | null
  username?: string | null
  image?: string | null
  bio?: string | null
  createdAt?: string
  followersCount?: number
  followingCount?: number
}

export interface Tag {
  id: string
  name: string
  slug?: string | null
}

export interface Comment {
  id: string
  content: string
  author: User
  postId: string
  createdAt: string
  parentId?: string | null
  replies: Comment[]
}

export interface PostStats {
  likes: number
  comments: number
}

export interface Post {
  id: string
  title: string
  content?: string
  excerpt?: string
  slug: string
  author: User
  tags?: Tag[]
  published: boolean
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  coverImage?: string | null
  readTime: number
  _count?: PostStats
}

export interface ApiResponse<T> {
  data: T
  message?: string
  nextCursor?: string | null
}