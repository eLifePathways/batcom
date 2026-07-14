import HeroSection from '@/components/sections/hero-section'
import VirusCategoriesSection from '@/components/sections/virus-categories-section'
import TeamSection from '@/components/sections/team-section'
import PublicationsSection from '@/components/sections/publications-section'
import BackgroundPapersSection from '@/components/sections/background-papers-section'
import { useQuery } from '@tanstack/react-query'
import { HeroSectionSettings } from '@shared/schema'

const Home = () => {
  const { data: heroSectionData, isLoading: heroSectionLoading } =
    useQuery<HeroSectionSettings>({
      queryKey: ['/api/hero-section/home'],
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
      <VirusCategoriesSection />
      <TeamSection showAllMembers={false} />
      <PublicationsSection />
      <BackgroundPapersSection showAllPapers={false} />
    </main>
  )
}

export default Home
