const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      password: hashedPassword,
      bio: 'A test user for StoryPress'
    }
  })

  console.log('✅ Created user:', user.username)

  // Create some test tags
  const techTag = await prisma.tag.upsert({
    where: { name: 'technology' },
    update: {},
    create: {
      name: 'technology',
      slug: 'technology'
    }
  })

  const webdevTag = await prisma.tag.upsert({
    where: { name: 'webdev' },
    update: {},
    create: {
      name: 'webdev',
      slug: 'webdev'
    }
  })

  console.log('✅ Created tags')

  // Create test posts
  const post1 = await prisma.post.upsert({
    where: { slug: 'getting-started-with-nextjs' },
    update: {},
    create: {
      title: 'Getting Started with Next.js',
      slug: 'getting-started-with-nextjs',
      content: `<h2>Introduction to Next.js</h2>
      <p>Next.js is a powerful React framework that makes building web applications easier and more efficient. In this guide, we'll explore the basics of Next.js and how to get started.</p>
      
      <h3>What is Next.js?</h3>
      <p>Next.js is a React framework that provides many features out of the box, including:</p>
      <ul>
        <li>Server-side rendering (SSR)</li>
        <li>Static site generation (SSG)</li>
        <li>API routes</li>
        <li>File-based routing</li>
        <li>Built-in CSS support</li>
      </ul>
      
      <h3>Getting Started</h3>
      <p>To create a new Next.js project, you can use the following command:</p>
      <pre><code>npx create-next-app@latest my-app</code></pre>
      
      <p>This will create a new Next.js application with all the necessary dependencies and configuration.</p>
      
      <h3>Conclusion</h3>
      <p>Next.js is an excellent choice for building modern web applications. Its powerful features and developer-friendly approach make it a popular choice among developers.</p>`,
      excerpt: 'Learn the basics of Next.js, a powerful React framework that makes building web applications easier and more efficient.',
      readTime: 5,
      published: true,
      publishedAt: new Date(),
      authorId: user.id,
      tags: {
        connect: [{ id: techTag.id }, { id: webdevTag.id }]
      }
    }
  })

  const post2 = await prisma.post.upsert({
    where: { slug: 'my-first-story' },
    update: {},
    create: {
      title: 'My First Story on StoryPress',
      slug: 'my-first-story',
      content: `<h2>Welcome to StoryPress!</h2>
      <p>This is my first story on StoryPress, and I'm excited to be part of this amazing community of writers and readers.</p>
      
      <h3>What is StoryPress?</h3>
      <p>StoryPress is a platform where writers can share their stories, thoughts, and ideas with a community of engaged readers.</p>
      
      <p>Happy writing! ✍️</p>`,
      excerpt: 'Welcome to my first story on StoryPress! Learn about this amazing platform for writers and readers.',
      readTime: 3,
      published: true,
      publishedAt: new Date(),
      authorId: user.id
    }
  })

  console.log('✅ Created posts:', [post1.slug, post2.slug])
  console.log('🎉 Seed completed!')
  console.log('Test credentials: test@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })