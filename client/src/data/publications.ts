export type Publication = {
  id: number;
  title: string;
  authors: string;
  year: number;
  abstract: string;
  evidenceQuality: "high" | "medium" | "low";
  evidenceType: "infection" | "spillover";
  virusCategoryId: number;
  region: string;
  publicationDate: string;
  link?: string;
};

export const publications: Publication[] = [
  {
    id: 1,
    title: "Bat Coronaviruses in China",
    authors: "Li et al.",
    year: 2018,
    abstract: "Comprehensive study of SARSr-CoV prevalence and geographical distribution in Chinese bat populations, identifying novel coronaviruses with potential for human infection.",
    evidenceQuality: "high",
    evidenceType: "infection",
    virusCategoryId: 1, // Coronaviridae
    region: "Asia",
    publicationDate: "2018-03-15",
    link: "https://example.com/bat-coronaviruses-china"
  },
  {
    id: 2,
    title: "Nipah Virus Emergence in Malaysia",
    authors: "Chua et al.",
    year: 2000,
    abstract: "Investigation of the 1998-1999 outbreak of encephalitis in humans and respiratory disease in pigs, identifying fruit bats as the natural reservoir of Nipah virus.",
    evidenceQuality: "medium",
    evidenceType: "spillover",
    virusCategoryId: 3, // Paramyxoviridae
    region: "Asia",
    publicationDate: "2000-09-26",
    link: "https://example.com/nipah-virus-emergence"
  },
  {
    id: 3,
    title: "Ebola Virus Antibodies in Fruit Bats",
    authors: "Leroy et al.",
    year: 2005,
    abstract: "Detection of Ebola virus antibodies in fruit bats from Central Africa, suggesting these species may be reservoir hosts for Ebola virus.",
    evidenceQuality: "low",
    evidenceType: "infection",
    virusCategoryId: 2, // Filoviridae
    region: "Africa",
    publicationDate: "2005-12-01",
    link: "https://example.com/ebola-antibodies-bats"
  },
  {
    id: 4,
    title: "MERS-CoV in Saudi Arabian Camels",
    authors: "Azhar et al.",
    year: 2014,
    abstract: "Isolation of MERS-CoV from a camel and its infected owner, providing evidence for camel-to-human transmission, with bats as the likely ancestral reservoir.",
    evidenceQuality: "high",
    evidenceType: "spillover",
    virusCategoryId: 1, // Coronaviridae
    region: "Middle East",
    publicationDate: "2014-06-05",
    link: "https://example.com/mers-cov-camels"
  },
  {
    id: 5,
    title: "Marburg Virus in Egyptian Fruit Bats",
    authors: "Towner et al.",
    year: 2009,
    abstract: "Isolation of Marburg virus from naturally infected Egyptian fruit bats (Rousettus aegyptiacus), confirming them as a reservoir host.",
    evidenceQuality: "high",
    evidenceType: "infection",
    virusCategoryId: 2, // Filoviridae
    region: "Africa",
    publicationDate: "2009-08-21",
    link: "https://example.com/marburg-egyptian-bats"
  },
  {
    id: 6,
    title: "Bat Rabies Surveillance in Europe",
    authors: "Schatz et al.",
    year: 2013,
    abstract: "Overview of bat rabies surveillance activities in Europe, highlighting the circulation of different lyssavirus species in European bat populations.",
    evidenceQuality: "medium",
    evidenceType: "infection",
    virusCategoryId: 5, // Rhabdoviridae
    region: "Europe",
    publicationDate: "2013-05-17",
    link: "https://example.com/bat-rabies-europe"
  },
  {
    id: 7,
    title: "Hendra Virus Transmission from Bats to Horses",
    authors: "Field et al.",
    year: 2001,
    abstract: "Investigation of the ecological and biological factors facilitating Hendra virus transmission from flying foxes to horses in Australia.",
    evidenceQuality: "medium",
    evidenceType: "spillover",
    virusCategoryId: 3, // Paramyxoviridae
    region: "Oceania",
    publicationDate: "2001-10-09",
    link: "https://example.com/hendra-transmission"
  },
  {
    id: 8,
    title: "SARS-CoV-2 Related Viruses in Bats from Southeast Asia",
    authors: "Zhou et al.",
    year: 2020,
    abstract: "Characterization of SARS-CoV-2 related coronaviruses in horseshoe bats from Southeast Asia, providing insights into the evolutionary origins of SARS-CoV-2.",
    evidenceQuality: "high",
    evidenceType: "infection",
    virusCategoryId: 1, // Coronaviridae
    region: "Asia",
    publicationDate: "2020-07-24",
    link: "https://example.com/sars-cov-2-related-bats"
  }
];
