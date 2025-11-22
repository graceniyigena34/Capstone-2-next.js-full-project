export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Changelog</h1>
      <div className="space-y-8">
        <div className="border-l-4 border-green-500 pl-4">
          <h2 className="text-xl font-semibold text-gray-900">v1.0.0</h2>
          <p className="text-gray-600 text-sm">Initial release</p>
          <ul className="mt-2 text-gray-700 space-y-1">
            <li>• Story creation and publishing</li>
            <li>• User authentication</li>
            <li>• Comments and likes</li>
            <li>• Tag system</li>
          </ul>
        </div>
      </div>
    </div>
  )
}