import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@shared/schema";
import TeamMemberCard from "@/components/ui/team-member-card";
import { Skeleton } from "@/components/ui/skeleton";

type TeamSectionProps = {
  title?: string;
  showAllMembers?: boolean;
};

const TeamSection = ({ title = "Who we are", showAllMembers = false }: TeamSectionProps) => {
  const { data: members, isLoading, error } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  const displayMembers = showAllMembers ? members : members?.slice(0, 3);

  const renderSkeleton = () => (
    <>
      {[...Array(showAllMembers ? 6 : 3)].map((_, index) => (
        <div key={index} className="flex flex-col gap-4 border border-gray-200 rounded-lg overflow-hidden">
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
  );

  return (
    <section id="who-we-are" className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-primary mb-10">{title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && renderSkeleton()}
          
          {error && (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500">Error loading team members. Please try again later.</p>
            </div>
          )}
          
          {displayMembers && displayMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              name={member.name}
              title={member.title}
              institution={member.institution}
              description={member.description}
              imageUrl={member.imageUrl || ''}
              email={member.email}
              website={member.website}
              socialMedia={member.socialMedia}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
