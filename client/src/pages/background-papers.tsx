import { useState, useEffect } from "react";
import HeroSection from "@/components/sections/hero-section";
import BackgroundPapersSection from "@/components/sections/background-papers-section";
import { useQuery } from "@tanstack/react-query";
import { VirusCategory } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BackgroundPapers = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  
  // Get the query parameter from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(parseInt(category));
    }
  }, []);
  
  const { data: categories } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  });

  return (
    <main>
      <HeroSection 
        title="Background Papers"
        description="Explore our comprehensive collection of background papers on bat viruses, providing essential context and foundational knowledge for understanding spillover events."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="w-full md:w-64 mb-8">
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Virus Family
          </label>
          <Select 
            value={selectedCategory?.toString() || ""} 
            onValueChange={(value) => setSelectedCategory(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger id="category-select">
              <SelectValue placeholder="All Virus Families" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Virus Families</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <BackgroundPapersSection virusCategoryId={selectedCategory} showAllPapers={true} />
    </main>
  );
};

export default BackgroundPapers;
