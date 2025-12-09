import { useQuery } from '@tanstack/react-query'
import { TeamMember } from '@shared/schema'
import TeamMemberCard from '@/components/ui/team-member-card'
import { Skeleton } from '@/components/ui/skeleton'

type TeamSectionProps = {
  title?: string
  showAllMembers?: boolean
}

const TeamSection = ({
  title = 'Who we are',
  showAllMembers = false,
}: TeamSectionProps) => {
  const {
    data: members,
    isLoading,
    error,
  } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  })

  console.log('TeamSection members', members)

  console.log('showAllMembers', showAllMembers)

  // Sort members by sortOrder if available
  const sortedMembers = members
    ? [...members].sort((a, b) => {
        const aNames = a.name.split(' ')
        const bNames = b.name.split(' ')
        const aLastName = aNames[aNames.length - 1]
        const bLastName = bNames[bNames.length - 1]
        return aLastName.localeCompare(bLastName)
        // If sortOrder is available on both, use it (handle null values)
        // const aSortOrder =
        //   a.sortOrder !== undefined && a.sortOrder !== null ? a.sortOrder : 0
        // const bSortOrder =
        //   b.sortOrder !== undefined && b.sortOrder !== null ? b.sortOrder : 0
      })
    : members

  const displayMembers = showAllMembers
    ? sortedMembers
    : sortedMembers?.slice(0, 3)

  const renderSkeleton = () => (
    <>
      {[...Array(showAllMembers ? 6 : 3)].map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 border border-gray-200 rounded-lg overflow-hidden"
        >
          <Skeleton className="h-64 w-full bg-gray-200" />
          <div className="space-y-2 p-6">
            <Skeleton className="h-6 w-3/4 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-16 w-full bg-gray-200" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-5 w-5 rounded-full bg-gray-200" />
              <Skeleton className="h-5 w-5 rounded-full bg-gray-200" />
              <Skeleton className="h-5 w-5 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </>
  )

  return (
    <section id="who-we-are" className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-primary mb-10">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && renderSkeleton()}
          {error && (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500">
                Error loading team members. Please try again later.
              </p>
            </div>
          )}
          {displayMembers &&
            displayMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                name={member.name}
                title={member.title}
                institution={member.institution}
                description={member.description}
                imageUrl={member.imageUrl || ''}
                email={member.email || undefined}
                website={member.website || undefined}
                socialMedia={member.socialMedia || undefined}
              />
            ))}
        </div>
      </div>
    </section>
  )
}

export default TeamSection
