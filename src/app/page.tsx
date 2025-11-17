import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-20">
        <h1 className="text-6xl font-bold tracking-tight mb-6">
          Where good ideas find you.
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Read and share new perspectives on just about any topic. Everyone's welcome.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded-full bg-green-600 px-8 py-3 text-lg font-medium text-white hover:bg-green-700"
        >
          Start reading
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
        {/* Featured posts will go here */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Featured Post 1</h3>
          <p className="text-gray-600 text-sm">This is a sample featured post description.</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Featured Post 2</h3>
          <p className="text-gray-600 text-sm">This is a sample featured post description.</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Featured Post 3</h3>
          <p className="text-gray-600 text-sm">This is a sample featured post description.</p>
        </div>
      </section>
    </div>
  )
}
