import React from "react";

type HeroSectionProps = {
  title: string;
  description: string;
};

const HeroSection = ({ title, description }: HeroSectionProps) => {
  return (
    <div className="pt-12 pb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{title}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-4 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default HeroSection;