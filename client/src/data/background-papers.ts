export type BackgroundPaper = {
  id: number;
  title: string;
  virusCategoryId: number;
  link?: string;
};

export const backgroundPapers: BackgroundPaper[] = [
  {
    id: 1,
    title: "Origin and evolution of pathogenic coronaviruses",
    virusCategoryId: 1, // Coronaviridae
    link: "https://example.com/coronavirus-evolution"
  },
  {
    id: 2,
    title: "Bat coronaviruses in China: A comprehensive review",
    virusCategoryId: 1, // Coronaviridae
    link: "https://example.com/bat-coronavirus-review"
  },
  {
    id: 3,
    title: "SARS-CoV-2: Zoonotic origins and wildlife reservoirs",
    virusCategoryId: 1, // Coronaviridae
    link: "https://example.com/sars-cov-2-origins"
  },
  {
    id: 4,
    title: "Fruit bats as reservoirs of Ebola virus",
    virusCategoryId: 2, // Filoviridae
    link: "https://example.com/fruit-bats-ebola"
  },
  {
    id: 5,
    title: "Marburg virus ecology in African bat populations",
    virusCategoryId: 2, // Filoviridae
    link: "https://example.com/marburg-ecology"
  },
  {
    id: 6,
    title: "Molecular characterization of filoviruses in bats",
    virusCategoryId: 2, // Filoviridae
    link: "https://example.com/filovirus-characterization"
  },
  {
    id: 7,
    title: "Nipah virus: Transmission dynamics and epidemiology",
    virusCategoryId: 3, // Paramyxoviridae
    link: "https://example.com/nipah-transmission"
  },
  {
    id: 8,
    title: "Hendra virus: Bat-horse-human transmission pathways",
    virusCategoryId: 3, // Paramyxoviridae
    link: "https://example.com/hendra-pathways"
  },
  {
    id: 9,
    title: "Evolutionary dynamics of bat paramyxoviruses",
    virusCategoryId: 3, // Paramyxoviridae
    link: "https://example.com/paramyxovirus-evolution"
  },
  {
    id: 10,
    title: "Bat lyssaviruses: Antigenic and genetic diversity",
    virusCategoryId: 5, // Rhabdoviridae
    link: "https://example.com/bat-lyssaviruses"
  },
  {
    id: 11,
    title: "Global patterns of rabies virus persistence in bat reservoirs",
    virusCategoryId: 5, // Rhabdoviridae
    link: "https://example.com/rabies-persistence"
  },
  {
    id: 12,
    title: "Ecological factors influencing bat-associated rhabdoviruses",
    virusCategoryId: 5, // Rhabdoviridae
    link: "https://example.com/rhabdovirus-ecology"
  },
  {
    id: 13,
    title: "Reovirus detection in bat populations worldwide",
    virusCategoryId: 4, // Sedoreoviridae
    link: "https://example.com/reovirus-detection"
  },
  {
    id: 14,
    title: "Molecular diversity of reoviruses in flying foxes",
    virusCategoryId: 4, // Sedoreoviridae
    link: "https://example.com/reovirus-diversity"
  },
  {
    id: 15,
    title: "Novel viruses in cave-dwelling bats: expanding our knowledge beyond common families",
    virusCategoryId: 6, // Other/Unknown
    link: "https://example.com/novel-bat-viruses"
  }
];
