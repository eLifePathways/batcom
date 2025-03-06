import HeroSection from "@/components/sections/hero-section";
import PublicationsSection from "@/components/sections/publications-section";

const Publications = () => {
  return (
    <main>
      <HeroSection 
        title="Research Publications"
        description="Explore our curated collection of research on bat virus spillover events, categorized by virus family, evidence quality, and geographical region."
      />
      <PublicationsSection />
    </main>
  );
};

export default Publications;
