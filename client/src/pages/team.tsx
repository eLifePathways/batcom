import HeroSection from '@/components/sections/hero-section'
import TeamSection from '@/components/sections/team-section'
import { useQuery } from '@tanstack/react-query'
import { HeroSectionSettings } from '@shared/schema'

const Team = () => {
  const { data: heroSectionData, isLoading: heroSectionLoading } =
    useQuery<HeroSectionSettings>({ queryKey: ['/api/hero-section/team'] })

  const { description = '', title = '' } = heroSectionData ?? {}
  return (
    <main className="container mx-auto px-4">
      <HeroSection
        description={description}
        loading={heroSectionLoading}
        title={title}
      />
      <div className="border-b border-border mb-10"></div>
      <TeamSection showAllMembers />
    </main>
  )
}

export default Team
