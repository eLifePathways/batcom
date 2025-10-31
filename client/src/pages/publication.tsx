import { useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Publication, Review } from '@shared/schema'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import NotFound from './not-found'

const PublicationPage = () => {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error } = useQuery<{
    publication: Publication
    reviews: Review[]
  }>({
    queryKey: [`/api/publication`, id],
  })

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        {/* Title */}
        <Skeleton className="h-8 w-2/3 mb-4 bg-gray-200" />

        {/* Abstract */}
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-5/6 bg-gray-200" />
          <Skeleton className="h-4 w-4/6 bg-gray-200" />
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-48 mb-10 bg-gray-200" />

        {/* Reviews header */}
        <Skeleton className="h-6 w-40 mb-4 bg-gray-200" />

        {/* Review list */}
        <ul className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <li
              key={i}
              className="p-4 border rounded-lg bg-white space-y-3 shadow-sm"
            >
              {/* Reviewer */}
              <Skeleton className="h-4 w-1/3 bg-gray-200" />
              {/* Review JSON placeholder */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full bg-gray-100" />
                <Skeleton className="h-3 w-5/6 bg-gray-100" />
                <Skeleton className="h-3 w-2/3 bg-gray-100" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  if (!data) {
    return <NotFound />
  }

  const { publication, reviews } = data

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-4">
        {publication.title}
      </h1>
      <p className="text-gray-600 mb-6">{publication.abstract}</p>

      {/* <Button asChild>
        <a href={publication.link} target="_blank" rel="noopener noreferrer">
          View Source Article
        </a>
      </Button> */}

      <h2 className="text-2xl font-semibold mt-10 mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map(review => (
            <li key={review.id} className="p-4 border rounded-lg bg-white">
              <p className="text-sm text-gray-500 mb-2">
                {review.users
                  ? `Reviewer: ${review.users.map(u => u.username).join(', ')}`
                  : 'Anonymous'}
              </p>
              <pre className="text-sm bg-gray-50 p-2 rounded">
                {review.jsonData
                  ? JSON.stringify(JSON.parse(review.jsonData), null, 2)
                  : 'No content'}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PublicationPage
