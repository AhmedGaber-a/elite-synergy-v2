import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold text-text-primary mb-3">Page Not Found</h1>
      <p className="text-text-muted mb-8 max-w-md">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className="bg-brand-orange text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-orange-dark transition-colors">
        Go Home
      </Link>
    </div>
  )
}
