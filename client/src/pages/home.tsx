import HeroSection from "@/components/sections/hero-section";
import VirusCategoriesSection from "@/components/sections/virus-categories-section";
import TeamSection from "@/components/sections/team-section";
import PublicationsSection from "@/components/sections/publications-section";
import BackgroundPapersSection from "@/components/sections/background-papers-section";

const Home = () => {
  return (
    <main className="container mx-auto px-4">
      <HeroSection 
        title="Our teams curate and assess historical and emerging research on bat virus spillover events."
        description="We prioritize high-quality research on spillover events to shed light on viral reservoirs, intermediate hosts, recipient hosts, and possible spillover pathways."
      />
      <div className="border-b border-gray-200 dark:border-gray-700 mb-10"></div>
      <VirusCategoriesSection />
      <TeamSection showAllMembers={false} />
      <PublicationsSection />
      <BackgroundPapersSection showAllPapers={false} />
    </main>
  );
};

export default Home;
