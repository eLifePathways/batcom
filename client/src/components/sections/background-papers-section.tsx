import { useQuery } from "@tanstack/react-query";
import { BackgroundPaper, VirusCategory } from "@shared/schema";
import { ArrowRight, FileText, Bug } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type BackgroundPapersSectionProps = {
  virusCategoryId?: number;
  showAllPapers?: boolean;
};

const BackgroundPapersSection = ({ virusCategoryId, showAllPapers = false }: BackgroundPapersSectionProps) => {
  const papersQueryKey = virusCategoryId 
    ? ['/api/background-papers', { virusCategoryId }] 
    : ['/api/background-papers'];
  
  const { data: papers, isLoading: isLoadingPapers } = useQuery<BackgroundPaper[]>({
    queryKey: papersQueryKey,
  });
  
  const { data: categories } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  });
  
  const getCategoryNameById = (id: number): string => {
    const category = categories?.find(cat => cat.id === id);
    return category?.name || "Unknown";
  };
  
  // Group papers by virus category
  const groupedPapers: Record<number, BackgroundPaper[]> = {};
  
  if (papers) {
    papers.forEach(paper => {
      if (!groupedPapers[paper.virusCategoryId]) {
        groupedPapers[paper.virusCategoryId] = [];
      }
      groupedPapers[paper.virusCategoryId].push(paper);
    });
  }
  
  // For limited view, only show a subset of categories
  const displayCategories = showAllPapers
    ? Object.keys(groupedPapers).map(Number)
    : Object.keys(groupedPapers).map(Number).slice(0, 4);
  
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      {[...Array(4)].map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          <Skeleton className="h-6 w-40 bg-gray-200" />
          <ul className="space-y-3">
            {[...Array(3)].map((_, itemIndex) => (
              <li key={itemIndex} className="flex items-start">
                <Skeleton className="h-5 w-5 mt-1 mr-2 bg-gray-200" />
                <Skeleton className="h-5 flex-grow bg-gray-200" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <section id="background-papers" className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column with Bat Images */}
          <div className="md:w-1/4">
            <img 
              src="/assets/viruses/bat-hanging.png" 
              alt="Bat hanging" 
              className="w-full h-auto rounded-lg shadow-md mb-6"
            />
            <img 
              src="/assets/viruses/bat-flying.png" 
              alt="Bat in flight" 
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
          
          {/* Right Column with Content */}
          <div className="md:w-3/4">
            <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-primary mb-8">
              Background Papers
            </h2>
            
            {isLoadingPapers ? (
              renderSkeleton()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {displayCategories.map(categoryId => (
                  <div key={categoryId}>
                    <h3 className="font-montserrat font-semibold text-primary text-xl mb-4 flex items-center">
                      <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white mr-2">
                        <Bug size={14} />
                      </span>
                      {getCategoryNameById(categoryId)}
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      {groupedPapers[categoryId]?.slice(0, 3).map(paper => (
                        <li key={paper.id} className="flex items-start">
                          <FileText className="text-blue-500 mt-1 mr-2" size={16} />
                          <a 
                            href={paper.link || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 transition"
                          >
                            {paper.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            
            {!showAllPapers && (
              <div className="mt-10">
                <Link to="/background-papers">
                  <Button className="inline-flex items-center gap-2">
                    View All Background Papers
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BackgroundPapersSection;
