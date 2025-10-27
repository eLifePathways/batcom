import HeroSection from '@/components/sections/hero-section'
import TeamSection from '@/components/sections/team-section'

const Team = () => {
  return (
    <main className="container mx-auto px-4">
      <HeroSection
        title="Our Research Team"
        description="Meet the dedicated researchers behind our work on bat virus spillover events. Our interdisciplinary team combines expertise in virology, epidemiology, ecology, and public health."
      />
      <div className="border-b border-gray-200 dark:border-gray-700 mb-10"></div>
      <TeamSection showAllMembers />
    </main>
  )
}

export default Team
