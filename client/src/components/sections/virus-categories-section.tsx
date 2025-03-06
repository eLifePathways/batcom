import { useQuery } from "@tanstack/react-query";
import { VirusCategory } from "@shared/schema";
import VirusCard from "@/components/ui/virus-card";
import { Skeleton } from "@/components/ui/skeleton";

const VirusCategoriesSection = () => {
  const { data: categories, isLoading, error } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  });

  const renderSkeleton = () => (
    <>
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex flex-col gap-4">
          <Skeleton className="h-48 w-full bg-gray-200" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-6 w-3/4 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-2/3 bg-gray-200" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {isLoading && renderSkeleton()}
          
          {error && (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500">Error loading virus categories. Please try again later.</p>
            </div>
          )}
          
          {categories && categories.map((category) => (
            <VirusCard
              key={category.id}
              id={category.id}
              name={category.name}
              description={category.description}
              imageUrl={category.imageUrl || ''}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VirusCategoriesSection;
