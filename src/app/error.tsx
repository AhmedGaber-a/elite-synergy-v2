'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div
      dir="rtl"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <div className="text-5xl">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-800">حصل خطأ غير متوقع</h2>
      <p className="max-w-md text-gray-500">
        عذراً، حدث خطأ أثناء تحميل الصفحة. يمكنك المحاولة مرة أخرى.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-xl bg-[#1E2A3A] px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#2a3b50] active:scale-95"
      >
        حاول مرة أخرى
      </button>
    </div>
  )
}
