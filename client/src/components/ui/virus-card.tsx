import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { Link } from 'wouter'

type VirusCardProps = {
  id: number
  name: string
  description: string
  imageUrl: string
}

const VirusCard = ({ id, name, description, imageUrl }: VirusCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition duration-300 h-full">
      <div className="h-48 overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={`${name} image`}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-heading font-semibold text-primary text-lg mb-2">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
        <Link
          to={`/publications?virusCategories=${id}`}
          className="inline-block mt-3 text-link hover:text-primary transition flex items-center gap-1"
        >
          View reviews <ArrowRight size={14} />
        </Link>
      </CardContent>
    </Card>
  )
}

export default VirusCard
