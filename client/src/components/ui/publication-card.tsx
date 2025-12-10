import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { Link } from 'wouter'
import { VirusCategory } from '@shared/schema'
import {
  EvidenceInfection,
  GEOGRAPHIC_REGIONS,
  Region,
} from '@shared/constants'

type PublicationCardProps = {
  id: number
  title: string
  authors: string
  year: number
  abstract: string
  evidenceInfection: EvidenceInfection
  virusCategories: VirusCategory[]
  virusCategoryIds: number[]
  regions: Region[]
  link?: string | null
}

const PublicationCard = ({
  id,
  title,
  authors,
  year,
  abstract,
  evidenceInfection,
  virusCategories,
  virusCategoryIds,
  regions,
  link,
}: PublicationCardProps) => {
  const evidenceInfectionClasses = {
    infectionHigh: 'bg-success h-1',
    infectionModerate: 'bg-warning h-1',
    infectionLow: 'bg-error h-1',
    infectionNot_Investigated: 'bg-gray h-1',
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition duration-300 h-full">
      <div
        className={`w-full ${evidenceInfectionClasses[evidenceInfection]}`}
      />
      <CardContent className="p-6">
        <h3 className="font-montserrat font-semibold text-primary text-xl mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {year} • {authors}
        </p>
        <p className="text-gray-700 mb-4">{abstract}</p>
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
          <div className="flex items-center flex-wrap gap-2">
            {virusCategoryIds.map(virusCategoryId => (
              <Link to={`/publications?virusCategories=${virusCategoryId}`}>
                <Badge
                  variant="default"
                  className="bg-primary hover:bg-primary/90"
                >
                  {virusCategories.find(v => v.id === virusCategoryId)?.name ||
                    'Unknown virus category'}
                </Badge>
              </Link>
            ))}
            {regions.map(region => (
              <Link to={`/publications?regions=${region}`}>
                <Badge variant="secondary">{GEOGRAPHIC_REGIONS[region]}</Badge>
              </Link>
            ))}
          </div>
          <Link
            to={`/publications/${id}`}
            className="text-blue-500 hover:text-blue-700 transition inline-flex items-center gap-1"
          >
            Read More <ArrowRight size={14} />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default PublicationCard
