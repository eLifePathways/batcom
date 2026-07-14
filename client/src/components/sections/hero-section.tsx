import React from 'react'
import { Skeleton } from '../ui/skeleton'

type HeroSectionProps = {
  loading?: boolean
  title: string
  description: string
}

const HeroSection = ({ description, loading, title }: HeroSectionProps) => {
  if (loading) {
    return (
      <div className="pt-12 pb-6">
        {/* Title (matches h1) */}
        <Skeleton className="h-9 md:h-10 w-3/4 max-w-xl mb-4" />
        {/* Description (matches the max-w-3xl paragraph) */}
        <div className="max-w-3xl space-y-2 mb-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <div className="pt-12 pb-6">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export default HeroSection
