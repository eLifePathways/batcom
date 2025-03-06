import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

type PublicationCardProps = {
  id: number;
  title: string;
  authors: string;
  year: number;
  abstract: string;
  evidenceQuality: "high" | "medium" | "low";
  virusCategory: string;
  region: string;
  link?: string;
};

const PublicationCard = ({
  id,
  title,
  authors,
  year,
  abstract,
  evidenceQuality,
  virusCategory,
  region,
  link,
}: PublicationCardProps) => {
  const evidenceClasses = {
    high: "bg-success h-1",
    medium: "bg-warning h-1",
    low: "bg-error h-1",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition duration-300 h-full">
      <div className={`w-full ${evidenceClasses[evidenceQuality]}`} />
      <CardContent className="p-6">
        <h3 className="font-montserrat font-semibold text-primary text-xl mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{year} • {authors}</p>
        <p className="text-gray-700 mb-4">{abstract}</p>
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <Badge variant="default" className="bg-primary hover:bg-primary/90">{virusCategory}</Badge>
            <Badge variant="secondary">{region}</Badge>
          </div>
          {link ? (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-700 transition inline-flex items-center gap-1"
            >
              Read More <ArrowRight size={14} />
            </a>
          ) : (
            <Link
              to={`/publications/${id}`}
              className="text-blue-500 hover:text-blue-700 transition inline-flex items-center gap-1"
            >
              Read More <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicationCard;
