type HeroSectionProps = {
  title: string;
  description: string;
};

const HeroSection = ({ title, description }: HeroSectionProps) => {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-primary mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
