import HeroSection from '@/components/sections/hero-section'
import PublicationsSection from '@/components/sections/publications-section'
import { useQuery } from '@tanstack/react-query'
import { HeroSectionSettings } from '@shared/schema'

const Publications = () => {
  const { data: heroSectionData, isLoading: heroSectionLoading } =
    useQuery<HeroSectionSettings>({
      queryKey: ['/api/hero-section/publications'],
    })

  const { description = '', title = '' } = heroSectionData ?? {}
  return (
    <main className="container mx-auto px-4">
      <HeroSection
        description={description}
        loading={heroSectionLoading}
        title={title}
      />
      <div className="border-b border-border mb-10"></div>
      <PublicationsSection />
    </main>
  )
}

export default Publications
