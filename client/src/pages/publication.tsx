import { Link, useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Publication, Review, VirusCategory } from '@shared/schema'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import NotFound from './not-found'
import { SafeHtml } from '@/components/ui/safe-html'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  BAT_SOURCE_HOST_GENI,
  EVIDENCE_QUALITY_INFECTION,
  EVIDENCE_QUALITY_SPILLOVER,
  EvidenceInfection,
  EvidenceSpillover,
  GEOGRAPHIC_REGIONS,
  INVESTIGATION_DETAILS,
  QUALITY_COLOURS,
  RECIPIENT_HOSTS,
  Region,
  REVIEW_COUNTRY_FIELD,
  REVIEW_FINAL_TAKE_FIELD,
  REVIEW_HOST_GENUS_FIELD,
  REVIEW_INVESTIGATION_DETAILS_FIELD,
  REVIEW_LIMITATIONS_FIELD,
  REVIEW_MAIN_FINDINGS_FIELD,
  REVIEW_POPULATION_SETTING_METHOD_FIELD,
  REVIEW_RECIPIENT_HOST_FIELD,
  REVIEW_STUDY_DESIGN_FIELD,
  REVIEW_STUDY_STRENGTHS_FIELD,
  REVIEW_VALUE_ADDED_FIELD,
  STUDY_DESIGNS,
} from '@shared/constants'
import { getValueFromReviewField } from '../../../shared/utils'
import ReviewField from '../components/sections/review-field-section'
import { getQualityColour } from '../lib/utils'

const PublicationPage = () => {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error } = useQuery<{
    publication: Publication
    reviews: Review[]
  }>({
    queryKey: [`/api/publication`, id],
  })

  const { data: virusCategories = [] } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  })

  const getReviewFieldContent = (
    review: Review,
    fieldName: string,
    enums?: any,
  ) => {
    const rawValue = getValueFromReviewField(
      review.jsonData.find(f => f.fieldName === fieldName),
    )

    if (Array.isArray(rawValue)) {
      if (!enums) return rawValue.join(', ')

      return rawValue.map(r => enums[r] as string).join(', ')
    }

    if (!enums) return rawValue

    return enums[rawValue]
  }

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

  const {
    abstract,
    authors,
    evidenceInfection,
    evidenceSpillover,
    link,
    regions,
    title,
    virusCategoryIds,
    year,
  } = publication

  const review = reviews[0]

  return (
    <section className="container mx-auto px-4 py-12 gap-40">
      <h1 className="text-3xl font-bold text-primary mb-4">{title}</h1>
      <p className="text-gray-600 text-md mb-4">
        {year} • {authors}
      </p>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 mb-4">
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
              <Badge variant="secondary">
                {GEOGRAPHIC_REGIONS[region as Region]}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 mb-4">
        <div className="flex items-center flex-wrap gap-2">
          <Link to={`/publications?evidenceInfections=${evidenceInfection}`}>
            <Badge
              color={getQualityColour(evidenceInfection)}
              variant="secondary"
              // className="bg-primary hover:bg-primary/90"
            >
              Evidence Quality of Infection:{' '}
              {
                EVIDENCE_QUALITY_INFECTION[
                  evidenceInfection as EvidenceInfection
                ]
              }
            </Badge>
          </Link>
          <Link to={`/publications?evidenceSpillovers=${evidenceSpillover}`}>
            <Badge
              color={getQualityColour(evidenceSpillover)}
              variant="secondary"
            >
              Evidence Quality of Spillover:{' '}
              {
                EVIDENCE_QUALITY_SPILLOVER[
                  evidenceSpillover as EvidenceSpillover
                ]
              }
            </Badge>
          </Link>
        </div>
      </div>
      {link && (
        <Button asChild className="mb-4">
          <a href={link} target="_blank" rel="noopener noreferrer">
            View Source Article <ExternalLink size={14} />
          </a>
        </Button>
      )}

      {abstract && (
        <p className="text-gray-600 mb-6">
          <SafeHtml html={abstract} />
        </p>
      )}

      {!reviews.length && <p className="text-gray-500">No reviews yet.</p>}

      {review && (
        <div className="gap-4">
          <ReviewField
            content={getReviewFieldContent(review, REVIEW_COUNTRY_FIELD)}
            title="Country"
          />
          <ReviewField
            content={getReviewFieldContent(
              review,
              REVIEW_HOST_GENUS_FIELD,
              BAT_SOURCE_HOST_GENI,
            )}
            title="Proposed Source Host (bat genus)"
          />
          <ReviewField
            content={getReviewFieldContent(
              review,
              REVIEW_RECIPIENT_HOST_FIELD,
              RECIPIENT_HOSTS,
            )}
            title="Recipient Host"
          />
          <ReviewField
            content={getReviewFieldContent(
              review,
              REVIEW_STUDY_DESIGN_FIELD,
              STUDY_DESIGNS,
            )}
            title="Study Design"
          />
          <ReviewField
            content={getReviewFieldContent(
              review,
              REVIEW_INVESTIGATION_DETAILS_FIELD,
              INVESTIGATION_DETAILS,
            )}
            title="Investigation Details"
          />
          <ReviewField
            content={getReviewFieldContent(
              review,
              REVIEW_POPULATION_SETTING_METHOD_FIELD,
            )}
            title="Population, Setting, and Methods"
          />
          <ReviewField
            content={getReviewFieldContent(review, REVIEW_MAIN_FINDINGS_FIELD)}
            title="Main Findings"
          />
          <ReviewField
            content={getReviewFieldContent(
              review,
              REVIEW_STUDY_STRENGTHS_FIELD,
            )}
            title="Study Strengths"
          />
          <ReviewField
            content={getReviewFieldContent(review, REVIEW_LIMITATIONS_FIELD)}
            title="Limitations"
          />
          <ReviewField
            content={getReviewFieldContent(review, REVIEW_VALUE_ADDED_FIELD)}
            title="Value Added"
          />
          <ReviewField
            content={getReviewFieldContent(review, REVIEW_FINAL_TAKE_FIELD)}
            title="Final Take"
          />
        </div>
      )}
    </section>
  )
}

export default PublicationPage
