import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { posts: true } },
    },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="mb-6 sm:mb-8 lg:mb-10 space-y-2">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-green-600">Topics</p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">Browse by tag</h1>
        <p className="text-sm sm:text-base text-gray-600">Find stories and authors by the topics they care about.</p>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug ?? tag.name}`}
            className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >
            <p className="text-base sm:text-lg font-semibold text-gray-900">#{tag.name}</p>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              {tag._count.posts === 1 ? '1 story' : `${tag._count.posts} stories`}
            </p>
          </Link>
        ))}
        {tags.length === 0 && (
          <div className="col-span-full rounded-xl sm:rounded-2xl border border-dashed border-gray-300 p-4 sm:p-6 text-sm text-gray-500 text-center">
            Tags will show up once you start publishing.
          </div>
        )}
      </div>
    </div>
  )
}

