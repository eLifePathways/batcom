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
      <div className="h-48 overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={`${name} image`}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-montserrat font-semibold text-primary text-lg mb-2">
          {name}
        </h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <Link
          to={`/publications?virusCategories=${id}`}
          className="inline-block mt-3 text-blue-500 hover:text-blue-700 transition flex items-center gap-1"
        >
          View reviews <ArrowRight size={14} />
        </Link>
      </CardContent>
    </Card>
  )
}

export default VirusCard
