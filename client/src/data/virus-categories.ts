export type VirusCategory = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

export const virusCategories: VirusCategory[] = [
  {
    id: 1,
    name: "Coronaviridae",
    description: "Family of enveloped, positive-sense, single-stranded RNA viruses.",
    imageUrl: "https://cdn.pixabay.com/photo/2020/04/02/19/07/virus-4996107_1280.png"
  },
  {
    id: 2,
    name: "Filoviridae",
    description: "Family of filamentous, enveloped, negative-sense RNA viruses.",
    imageUrl: "https://cdn.pixabay.com/photo/2020/04/09/08/23/virus-5020400_1280.jpg"
  },
  {
    id: 3,
    name: "Paramyxoviridae",
    description: "Family of negative-sense RNA viruses, including measles and mumps.",
    imageUrl: "https://cdn.pixabay.com/photo/2020/03/16/16/29/virus-4937553_1280.jpg"
  },
  {
    id: 4,
    name: "Sedoreoviridae",
    description: "Subfamily of viruses within the family Reoviridae.",
    imageUrl: "https://cdn.pixabay.com/photo/2020/04/10/13/23/virus-5025901_1280.jpg"
  },
  {
    id: 5,
    name: "Rhabdoviridae",
    description: "Family of negative-sense RNA viruses, including rabies virus.",
    imageUrl: "https://cdn.pixabay.com/photo/2020/03/26/19/06/coronavirus-4972480_1280.jpg"
  },
  {
    id: 6,
    name: "Other/Unknown",
    description: "Additional viral families and unclassified viruses under investigation.",
    imageUrl: "https://cdn.pixabay.com/photo/2020/03/31/17/03/virus-4988544_1280.jpg"
  }
];
