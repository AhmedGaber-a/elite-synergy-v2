import React from 'react'

export function FeatureRow({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="flex-1">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-text-body">{description}</p>
      </div>
    </div>
  )
}
