import HeroSection from "@/components/sections/hero-section";
import TeamSection from "@/components/sections/team-section";

const Team = () => {
  return (
    <main>
      <HeroSection 
        title="Our Research Team"
        description="Meet the dedicated researchers behind our work on bat virus spillover events. Our interdisciplinary team combines expertise in virology, epidemiology, ecology, and public health."
      />
      <TeamSection showAllMembers={true} />
    </main>
  );
};

export default Team;
