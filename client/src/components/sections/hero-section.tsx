import React from "react";

type HeroSectionProps = {
  title: string;
  description: string;
};

const HeroSection = ({ title, description }: HeroSectionProps) => {
  return (
    <div className="pt-10 pb-6 mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-5">{title}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
        {description}
      </p>
      <div className="mt-10 border-b border-gray-200 dark:border-gray-700"></div>
    </div>
  );
};

export default HeroSection;