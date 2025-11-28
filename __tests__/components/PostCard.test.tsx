import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/posts/PostCard'
import type { Post } from '@/types'

const mockPost: Post = {
  id: 'post_1',
  title: 'Test post',
  content: '<p>Hello world</p>',
  excerpt: 'Hello world',
  slug: 'test-post',
  author: {
    id: 'user_1',
    email: 'demo@example.com',
    name: 'Demo Author',
    username: 'demo',
  },
  tags: [{ id: 'tag_1', name: 'react', slug: 'react' }],
  published: true,
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  readTime: 3,
  coverImage: undefined,
  _count: {
    likes: 5,
    comments: 2,
  },
}

describe('PostCard', () => {
  it('renders post metadata', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText(/Test post/i)).toBeInTheDocument()
    expect(screen.getByText(/Demo Author/i)).toBeInTheDocument()
    expect(screen.getByText(/#react/i)).toBeInTheDocument()
    expect(screen.getByText(/❤️ 5/i)).toBeInTheDocument()
    expect(screen.getByText(/💬 2/i)).toBeInTheDocument()
  })
})

