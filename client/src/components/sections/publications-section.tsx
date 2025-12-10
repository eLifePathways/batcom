import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FilterState,
  Publication,
  VirusCategory,
  ZeroCountsFor,
} from '@shared/schema'
import PublicationCard from '@/components/ui/publication-card'
import FilterMenu from '@/components/ui/filter-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { useSearchParams } from '@/hooks'
import { useLocation } from 'wouter'
import {
  EVIDENCE_QUALITY_INFECTION,
  EVIDENCE_QUALITY_SPILLOVER,
  EvidenceInfection,
  EvidenceSpillover,
  GEOGRAPHIC_REGIONS,
  Region,
} from '@shared/constants'

type EvidenceYear<
  I extends Record<string, any>,
  S extends Record<string, any>,
> = { year: number } & ZeroCountsFor<I> & ZeroCountsFor<S>

type InfectionKeys = typeof EVIDENCE_QUALITY_INFECTION
type SpilloverKeys = typeof EVIDENCE_QUALITY_SPILLOVER

const yearCounts: Record<
  number,
  EvidenceYear<InfectionKeys, SpilloverKeys>
> = {}

const QUALITY_COLOURS = {
  High: '#16a34a',
  Moderate: '#eab308',
  Low: '#dc2626',
  Not_Investigated: '#9ca3af',
} as const

type QualityKey = keyof typeof QUALITY_COLOURS

const getQualityColour = (key: string): string => {
  const quality = key.slice(9) as QualityKey
  return QUALITY_COLOURS[quality]
}

export type PublicationsSectionProps = {
  categories?: VirusCategory[]
  filters: FilterState
  isLoadingPublications: boolean
  onApplyFilters: () => void
  onSetFilters: React.Dispatch<React.SetStateAction<FilterState>>
  publications?: Publication[]
}

const PublicationsSection = () => {
  const [pageSize, setPageSize] = useState(4)
  const [filters, setFilters] = useState<FilterState>({
    virusCategories: [],
    evidenceInfections: [],
    evidenceSpillovers: [],
    yearRanges: [],
    regions: [],
  })

  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const [location] = useLocation()

  const {
    data: publications,
    isLoading: isLoadingPublications,
    refetch: refetchPublications,
  } = useQuery<Publication[]>({
    queryKey: ['/api/publications', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      console.log('query params', params)
      for (const [key, values] of Object.entries(filters)) {
        if (values.length) params.append(key, values.join(','))
      }
      const res = await fetch(`/api/publications?${params.toString()}`)
      return res.json()
    },
  })

  const { data: categories } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  })

  const filterGroups = [
    {
      id: 'virusCategories',
      title: 'Virus Category',
      options:
        categories?.map(c => ({ id: c.id.toString(), label: c.name })) || [],
    },
    {
      id: 'evidenceInfections',
      title: 'Evidence Quality: Infection',
      options: Object.entries(EVIDENCE_QUALITY_INFECTION).map(
        ([id, label]) => ({ id, label }),
      ),
    },
    {
      id: 'evidenceSpillovers',
      title: 'Evidence Quality: Spillover',
      options: Object.entries(EVIDENCE_QUALITY_SPILLOVER).map(
        ([id, label]) => ({ id, label }),
      ),
    },
    {
      id: 'yearRanges',
      title: 'Year of Publication',
      options: [
        { id: '1980-1990', label: '1980-1990' },
        { id: '1990-2000', label: '1990-2000' },
        { id: '2000-2010', label: '2000-2010' },
        { id: '2010-2020', label: '2010-2020' },
        { id: '2020-present', label: '2020-present' },
      ],
    },
    {
      id: 'regions',
      title: 'Regions',
      options: Object.entries(GEOGRAPHIC_REGIONS).map(([id, label]) => ({
        id,
        label,
      })),
    },
  ]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const virusCategories = params.get('virusCategories')
    const evidenceInfections = params.get('evidenceInfections')
    const evidenceSpillovers = params.get('evidenceSpillovers')
    const yearRanges = params.get('yearRanges')
    const regions = params.get('regions')

    const nextFilters = {
      ...(virusCategories && { virusCategories: [virusCategories] }),
      ...(evidenceInfections && { evidenceInfections: [evidenceInfections] }),
      ...(evidenceSpillovers && { evidenceSpillovers: [evidenceSpillovers] }),
      ...(yearRanges && { yearRanges: [yearRanges] }),
      ...(regions && { regions: [regions] }),
    }

    setFilters(prev => ({ ...prev, ...nextFilters }))
    applyFilters()
  }, [window.location.search, location])

  const handleFilterChange = (
    filterGroup: string,
    selectedOptions: string[],
  ) => {
    setFilters(prev => ({
      ...prev,
      [filterGroup]: selectedOptions,
    }))
  }

  const applyFilters = () => {
    console.log('applying filters', filters)
    queryClient.invalidateQueries({ queryKey: ['/api/publications'] })
    refetchPublications()
  }

  const getCategoryNameById = (id: number): string => {
    const category = categories?.find(cat => cat.id === id)
    return category?.name || 'Unknown'
  }

  // Filter publications based on selected filters
  const filteredPublications = publications?.filter(pub => {
    const infectionMatch =
      filters.evidenceInfections.length === 0 ||
      filters.evidenceInfections.includes(pub.evidenceInfection)

    const spilloverMatch =
      filters.evidenceSpillovers.length === 0 ||
      filters.evidenceSpillovers.includes(pub.evidenceSpillover)

    const regionMatch =
      filters.regions.length === 0 ||
      pub.regions.some(region => filters.regions.includes(region))

    const yearMatch =
      filters.yearRanges.length === 0 ||
      filters.yearRanges.some(range => {
        const [start, end] = range.split('-')
        const startYear = parseInt(start)
        const endYear =
          end === 'present' ? new Date().getFullYear() : parseInt(end)
        return pub.year >= startYear && pub.year <= endYear
      })

    return infectionMatch && spilloverMatch && regionMatch && yearMatch
  })

  const displayedPublications: Publication[] =
    filteredPublications?.slice(0, pageSize) || []

  const loadMore = () => {
    setPageSize(prev => prev + 4)
  }

  // Chart data preparation
  function zeroCounts<T extends Record<string, any>>(obj: T): ZeroCountsFor<T> {
    return Object.fromEntries(
      Object.keys(obj).map(k => [k, 0]),
    ) as ZeroCountsFor<T>
  }
  const prepareChartData = () => {
    if (!publications) return []

    const yearCounts: Record<
      number,
      EvidenceYear<InfectionKeys, SpilloverKeys>
    > = {}

    publications.forEach(pub => {
      if (!yearCounts[pub.year]) {
        yearCounts[pub.year] = {
          year: pub.year,
          ...zeroCounts(EVIDENCE_QUALITY_INFECTION),
          ...zeroCounts(EVIDENCE_QUALITY_SPILLOVER),
        }
      }

      yearCounts[pub.year][pub.evidenceInfection as EvidenceInfection] += 1
      yearCounts[pub.year][pub.evidenceSpillover as EvidenceSpillover] += 1
    })

    return Object.values(yearCounts).sort((a, b) => a.year - b.year)
  }

  const chartData = prepareChartData()

  const renderSkeleton = () => (
    <>
      {[...Array(2)].map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="h-1 w-full bg-gray-200" />
          <div className="space-y-2 p-6">
            <Skeleton className="h-6 w-3/4 bg-gray-200" />
            <Skeleton className="h-4 w-1/3 bg-gray-200" />
            <Skeleton className="h-16 w-full bg-gray-200" />
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
                <Skeleton className="h-6 w-16 rounded-full bg-gray-200" />
              </div>
              <Skeleton className="h-4 w-20 bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </>
  )

  return (
    <section
      id="recent-reviews"
      className="bg-gray-50 py-12 md:py-16"
      key={location}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-primary mb-4 md:mb-0">
            Most Recent Reviews
          </h2>

          <FilterMenu
            filterGroups={filterGroups}
            selectedFilters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={applyFilters}
          />
        </div>

        {/* Data Visualization */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="font-montserrat font-semibold text-primary text-lg mb-4">
            Publication Year of Papers Reviewed
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                barCategoryGap="30%"
                barGap={2}
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="1 0" vertical={false} />
                <XAxis dataKey="year" padding={{ left: 20, right: 20 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.entries(EVIDENCE_QUALITY_INFECTION).map(
                  ([key, label]) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      name={`Infection – ${label}`}
                      fill={getQualityColour(key)}
                    />
                  ),
                )}

                {Object.entries(EVIDENCE_QUALITY_SPILLOVER).map(
                  ([key, label]) => (
                    <Bar
                      key={`spillover-${key}`}
                      dataKey={key}
                      name={`Spillover – ${label}`}
                      fill={getQualityColour(key)}
                    />
                  ),
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-gray-300 border mr-2"></div>
                <span className="text-sm text-gray-700">
                  Infection (left bars per year)
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-gray-500 border mr-2"></div>
                <span className="text-sm text-gray-700">
                  Spillover (right bars per year)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="w-12 h-1 bg-green-600 mr-2"></div>
                <span className="text-sm text-gray-700">High Quality</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-1 bg-yellow-500 mr-2"></div>
                <span className="text-sm text-gray-700">Moderate Quality</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-1 bg-red-600 mr-2"></div>
                <span className="text-sm text-gray-700">Low Quality</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-1 bg-gray-400 mr-2"></div>
                <span className="text-sm text-gray-700">Not Investigated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Publications List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoadingPublications && renderSkeleton()}

          {displayedPublications &&
            displayedPublications.map(publication => (
              <PublicationCard
                key={publication.id}
                id={publication.id}
                title={publication.title}
                authors={publication.authors}
                year={publication.year}
                abstract={publication.abstract}
                evidenceInfection={
                  publication.evidenceInfection as EvidenceInfection
                }
                virusCategories={categories ?? []}
                virusCategoryIds={publication.virusCategoryIds}
                regions={publication.regions as Region[]}
                link={publication.link}
              />
            ))}

          {filteredPublications && filteredPublications.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                No publications found matching your filters.
              </p>
            </div>
          )}
        </div>

        {filteredPublications &&
          displayedPublications &&
          displayedPublications.length < filteredPublications.length && (
            <div className="mt-8 text-center">
              <Button onClick={loadMore}>Load More Publications</Button>
            </div>
          )}
      </div>
    </section>
  )
}

export default PublicationsSection
