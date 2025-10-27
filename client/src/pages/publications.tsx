import HeroSection from '@/components/sections/hero-section'
import PublicationsSection from '@/components/sections/publications-section'

const Publications = () => {
  return (
    <main className="container mx-auto px-4">
      <HeroSection
        title="Most Recent Reviews"
        description="Explore our curated collection of research on bat virus spillover events, categorized by virus family, evidence quality, and geographical region."
      />
      <div className="border-b border-gray-200 dark:border-gray-700 mb-10"></div>
      <PublicationsSection />
    </main>
  )
}

export default Publications
