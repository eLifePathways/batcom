import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeroSection from "@/components/sections/hero-section";

// Tabs content components
const Kotahi = () => (
  <div className="space-y-4">
    <h3 className="text-2xl font-semibold text-primary mb-4">Kotahi</h3>
    <p className="text-gray-700 dark:text-gray-300">
      Kotahi is the peer review management system we use to conduct our reviews systematically.
      It allows us to track, organize, and review scientific literature in a structured manner.
    </p>
    <p className="text-gray-700 dark:text-gray-300">
      Through Kotahi, we can implement our structured review process, ensuring that all scientific
      publications are reviewed according to the same rigorous criteria and standards.
    </p>
    <div className="mt-6">
      <a 
        href="https://kotahi.community/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
      >
        Learn more about Kotahi
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
);

const OurProcess = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-semibold text-primary mb-4">Our Process</h3>
    
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-0.5 bg-primary/20"></div>
      
      {/* Step 1 */}
      <div className="relative pl-10 pb-8">
        <div className="absolute left-2 top-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white font-bold">1</span>
        </div>
        <h4 className="text-xl font-medium text-primary mb-2">Literature Search</h4>
        <p className="text-gray-700 dark:text-gray-300">
          We conduct comprehensive searches of scientific databases to identify relevant studies on bat viruses
          that may pose risks for spillover to humans. Our search strategies are regularly updated to capture
          new research.
        </p>
      </div>
      
      {/* Step 2 */}
      <div className="relative pl-10 pb-8">
        <div className="absolute left-2 top-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white font-bold">2</span>
        </div>
        <h4 className="text-xl font-medium text-primary mb-2">Screening</h4>
        <p className="text-gray-700 dark:text-gray-300">
          Each publication is screened by at least two team members to determine if it meets our inclusion criteria.
          We focus on studies that provide evidence of bat viral pathogens with zoonotic potential.
        </p>
      </div>
      
      {/* Step 3 */}
      <div className="relative pl-10 pb-8">
        <div className="absolute left-2 top-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white font-bold">3</span>
        </div>
        <h4 className="text-xl font-medium text-primary mb-2">Quality Assessment</h4>
        <p className="text-gray-700 dark:text-gray-300">
          We evaluate the scientific rigor of each included study based on our quality of evidence criteria,
          examining study design, methodology, and consistency with established scientific standards.
        </p>
      </div>
      
      {/* Step 4 */}
      <div className="relative pl-10">
        <div className="absolute left-2 top-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white font-bold">4</span>
        </div>
        <h4 className="text-xl font-medium text-primary mb-2">Data Extraction & Synthesis</h4>
        <p className="text-gray-700 dark:text-gray-300">
          We extract standardized data from each publication and synthesize findings to identify patterns,
          trends, and knowledge gaps. This information is regularly updated on our platform to provide
          the most current understanding of bat viruses with zoonotic potential.
        </p>
      </div>
    </div>
  </div>
);

const CuratedStrategy = () => (
  <div className="space-y-4">
    <h3 className="text-2xl font-semibold text-primary mb-4">Our Curated Strategy</h3>
    
    <p className="text-gray-700 dark:text-gray-300">
      Our team employs a carefully curated strategy to identify, analyze, and assess the most relevant
      scientific evidence regarding bat-borne viruses and their zoonotic potential.
    </p>
    
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-primary mb-3">Strategic Focus Areas</h4>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>High-risk viral families with established or potential zoonotic transmission</li>
          <li>Geographic regions with high bat diversity and human-bat interfaces</li>
          <li>Viral genomic characteristics associated with cross-species transmission</li>
          <li>Ecological drivers of spillover events</li>
        </ul>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-primary mb-3">Communication Approach</h4>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Regular scientific publications in peer-reviewed journals</li>
          <li>Background papers accessible to both scientists and public health officials</li>
          <li>Interactive database of bat virus evidence</li>
          <li>Collaboration with public health agencies for risk assessment</li>
        </ul>
      </div>
    </div>
    
    <div className="bg-primary/5 p-6 rounded-lg mt-6 border border-primary/20">
      <h4 className="text-lg font-medium text-primary mb-2">Our Commitment</h4>
      <p className="text-gray-700 dark:text-gray-300">
        We are committed to maintaining scientific rigor while making our findings accessible
        to scientists, public health officials, and policymakers. Our goal is to contribute
        to proactive risk assessment and preparedness for potential zoonotic spillover events.
      </p>
    </div>
  </div>
);

const QualityDefinitions = () => (
  <div className="space-y-4">
    <h3 className="text-2xl font-semibold text-primary mb-4">Definitions for Quality of Evidence</h3>
    
    <p className="text-gray-700 dark:text-gray-300">
      We use a structured framework to assess the quality of evidence in publications related to
      bat viruses and their zoonotic potential. This ensures consistency in our evaluations and
      transparency in our assessments.
    </p>
    
    <div className="space-y-6 mt-6">
      {/* High Quality */}
      <div className="border-l-4 border-green-500 pl-4 py-2">
        <h4 className="text-xl font-medium text-green-700 dark:text-green-400">High Quality</h4>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Research that demonstrates robust methodology, comprehensive data collection, appropriate
          statistical analysis, and clear presentation of results. Studies with high reproducibility,
          large sample sizes, and controls for confounding variables.
        </p>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          <span>Green indicator in our publication database</span>
        </div>
      </div>
      
      {/* Medium Quality */}
      <div className="border-l-4 border-yellow-500 pl-4 py-2">
        <h4 className="text-xl font-medium text-yellow-700 dark:text-yellow-400">Medium Quality</h4>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Research with sound methodology but with limitations in one or more areas such as sample
          size, controls, or data analysis. Findings are valid but may have reduced generalizability
          or precision.
        </p>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
          <span>Yellow indicator in our publication database</span>
        </div>
      </div>
      
      {/* Low Quality */}
      <div className="border-l-4 border-red-500 pl-4 py-2">
        <h4 className="text-xl font-medium text-red-700 dark:text-red-400">Low Quality</h4>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Research with significant methodological limitations, small sample sizes, lack of 
          appropriate controls, or inadequate reporting of methods and results. These studies
          provide preliminary evidence that requires further validation.
        </p>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          <span>Red indicator in our publication database</span>
        </div>
      </div>
    </div>
    
    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="text-lg font-medium text-primary mb-2">Methodology Note</h4>
      <p className="text-gray-700 dark:text-gray-300">
        Our quality assessment is performed independently by at least two team members, with
        disagreements resolved through discussion or by a third reviewer. This process ensures
        that our evaluations are objective and consistent across different types of evidence.
      </p>
    </div>
  </div>
);

export default function WhatWeDo() {
  const [activeTab, setActiveTab] = useState("kotahi");

  return (
    <main className="container mx-auto px-4">
      <HeroSection 
        title="What We Do" 
        description="At Bat-Com, we systematically review and evaluate scientific evidence related to bat viruses and their potential to cause human disease. Our work focuses on providing high-quality, accessible information to researchers, public health officials, and policymakers."
      />
      <div className="border-b border-gray-200 dark:border-gray-700 mb-10"></div>
      
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="kotahi">Kotahi</TabsTrigger>
            <TabsTrigger value="process">Our Process</TabsTrigger>
            <TabsTrigger value="strategy">Our Curated Strategy</TabsTrigger>
            <TabsTrigger value="quality">Quality of Evidence</TabsTrigger>
          </TabsList>
          
          <div className="mt-8 p-6 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 min-h-[400px]">
            <TabsContent value="kotahi"><Kotahi /></TabsContent>
            <TabsContent value="process"><OurProcess /></TabsContent>
            <TabsContent value="strategy"><CuratedStrategy /></TabsContent>
            <TabsContent value="quality"><QualityDefinitions /></TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}