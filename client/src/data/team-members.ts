export type TeamMember = {
  id: number;
  name: string;
  title: string;
  institution: string;
  description: string;
  imageUrl: string;
  email?: string;
  website?: string;
  socialMedia?: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Emily Gurley",
    title: "Professor of Epidemiology",
    institution: "Johns Hopkins University - Bloomberg School of Public Health",
    description: "Professor of Epidemiology specializing in zoonotic disease transmission and viral spillover events.",
    imageUrl: "https://cdn.pixabay.com/photo/2023/03/31/12/20/researcher-7889025_1280.jpg",
    email: "egurley@jhu.edu",
    website: "https://www.jhsph.edu/faculty/directory/profile/emily-gurley",
    socialMedia: "https://www.linkedin.com/in/emily-gurley"
  },
  {
    id: 2,
    name: "Clif McKee",
    title: "Research Scientist",
    institution: "Johns Hopkins University - Bloomberg School of Public Health",
    description: "Research Scientist focused on bat ecology and viral evolution in bat populations.",
    imageUrl: "https://cdn.pixabay.com/photo/2021/05/03/11/54/laboratory-6225888_1280.jpg",
    email: "cmckee@jhu.edu",
    website: "https://www.jhsph.edu/faculty/directory/profile/clif-mckee",
    socialMedia: "https://twitter.com/clif_mckee"
  },
  {
    id: 3,
    name: "Jane Smith",
    title: "Virologist",
    institution: "Johns Hopkins University - Bloomberg School of Public Health",
    description: "Virologist specializing in emerging pathogens and cross-species transmission.",
    imageUrl: "https://cdn.pixabay.com/photo/2022/06/20/09/34/scientist-7273248_1280.jpg",
    email: "jsmith@jhu.edu",
    website: "https://www.jhsph.edu/faculty/directory/profile/jane-smith",
    socialMedia: "https://www.researchgate.net/profile/jane-smith"
  },
  {
    id: 4,
    name: "Michael Johnson",
    title: "Ecological Modeler",
    institution: "Johns Hopkins University - Bloomberg School of Public Health",
    description: "Develops computational models to understand bat migration patterns and potential spillover hotspots.",
    imageUrl: "https://cdn.pixabay.com/photo/2023/09/18/19/45/scientist-8260696_1280.jpg",
    email: "mjohnson@jhu.edu",
    website: "https://www.jhsph.edu/faculty/directory/profile/michael-johnson",
    socialMedia: "https://twitter.com/mjohnson_eco"
  },
  {
    id: 5,
    name: "Sarah Chen",
    title: "Molecular Biologist",
    institution: "Johns Hopkins University - Bloomberg School of Public Health",
    description: "Specializes in genomic analysis of bat viruses and their potential for human adaptation.",
    imageUrl: "https://cdn.pixabay.com/photo/2020/07/23/01/29/woman-5430716_1280.jpg",
    email: "schen@jhu.edu",
    website: "https://www.jhsph.edu/faculty/directory/profile/sarah-chen",
    socialMedia: "https://www.linkedin.com/in/sarah-chen-bio"
  },
  {
    id: 6,
    name: "David Nguyen",
    title: "Field Researcher",
    institution: "Johns Hopkins University - Bloomberg School of Public Health",
    description: "Conducts field studies on bat colonies in Southeast Asia, sampling for novel viruses and monitoring population dynamics.",
    imageUrl: "https://cdn.pixabay.com/photo/2023/03/31/12/20/researcher-7889025_1280.jpg",
    email: "dnguyen@jhu.edu",
    website: "https://www.jhsph.edu/faculty/directory/profile/david-nguyen",
    socialMedia: "https://www.instagram.com/batresearch_dnguyen"
  }
];
