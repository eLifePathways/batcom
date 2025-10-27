import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Publication, VirusCategory } from '@shared/schema'
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

type FilterState = Record<string, string[]>

const PublicationsSection = () => {
  const [filters, setFilters] = useState<FilterState>({
    evidenceQuality: [],
    evidenceType: [],
    yearRange: [],
    region: [],
  })

  const [pageSize, setPageSize] = useState(4)

  const { data: publications, isLoading: isLoadingPublications } = useQuery<
    Publication[]
  >({
    queryKey: ['/api/publications'],
  })

  const { data: categories } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  })

  const filterGroups = [
    {
      id: 'evidenceQuality',
      title: 'Evidence Quality',
      options: [
        { id: 'high', label: 'High' },
        { id: 'medium', label: 'Medium' },
        { id: 'low', label: 'Low' },
      ],
    },
    {
      id: 'evidenceType',
      title: 'Evidence Type',
      options: [
        { id: 'infection', label: 'Evidence of Infection' },
        { id: 'spillover', label: 'Evidence of Spillover' },
      ],
    },
    {
      id: 'yearRange',
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
      id: 'region',
      title: 'Regions',
      options: [
        { id: 'Africa', label: 'Africa' },
        { id: 'Americas', label: 'Americas' },
        { id: 'Asia', label: 'Asia' },
        { id: 'Europe', label: 'Europe' },
        { id: 'Oceania', label: 'Oceania' },
        { id: 'Middle East', label: 'Middle East' },
      ],
    },
  ]

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
    // In a real application, this would trigger a new API call with filter parameters
    // For now, we're just setting the state which will be used to filter the local data
  }

  const getCategoryNameById = (id: number): string => {
    const category = categories?.find(cat => cat.id === id)
    return category?.name || 'Unknown'
  }

  // Filter publications based on selected filters
  const filteredPublications = publications?.filter(pub => {
    const qualityMatch =
      filters.evidenceQuality.length === 0 ||
      filters.evidenceQuality.includes(pub.evidenceQuality)

    const typeMatch =
      filters.evidenceType.length === 0 ||
      filters.evidenceType.includes(pub.evidenceType)

    const regionMatch =
      filters.region.length === 0 || filters.region.includes(pub.region)

    const yearMatch =
      filters.yearRange.length === 0 ||
      filters.yearRange.some(range => {
        const [start, end] = range.split('-')
        const startYear = parseInt(start)
        const endYear =
          end === 'present' ? new Date().getFullYear() : parseInt(end)
        return pub.year >= startYear && pub.year <= endYear
      })

    return qualityMatch && typeMatch && regionMatch && yearMatch
  })

  const displayedPublications = filteredPublications?.slice(0, pageSize)

  const loadMore = () => {
    setPageSize(prev => prev + 4)
  }

  // Chart data preparation
  const prepareChartData = () => {
    if (!publications) return []

    const yearCounts: Record<
      number,
      { year: number; infection: number; spillover: number }
    > = {}

    publications.forEach(pub => {
      if (!yearCounts[pub.year]) {
        yearCounts[pub.year] = { year: pub.year, infection: 0, spillover: 0 }
      }

      if (pub.evidenceType === 'infection') {
        yearCounts[pub.year].infection += 1
      } else if (pub.evidenceType === 'spillover') {
        yearCounts[pub.year].spillover += 1
      }
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
    <section id="recent-reviews" className="bg-gray-50 py-12 md:py-16">
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
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="infection"
                  name="Evidence of Infection"
                  fill="#002D72"
                />
                <Bar
                  dataKey="spillover"
                  name="Evidence of Spillover"
                  fill="#418FDE"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                <span className="text-sm text-gray-700">
                  Evidence of Infection
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-400 mr-2"></div>
                <span className="text-sm text-gray-700">
                  Evidence of How Spillover Occurred
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <div className="w-12 h-1 bg-green-600 mr-2"></div>
                <span className="text-sm text-gray-700">
                  High Quality Evidence
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-1 bg-yellow-500 mr-2"></div>
                <span className="text-sm text-gray-700">
                  Medium Quality Evidence
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-1 bg-red-600 mr-2"></div>
                <span className="text-sm text-gray-700">
                  Low Quality Evidence
                </span>
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
                evidenceQuality={
                  publication.evidenceQuality as 'high' | 'medium' | 'low'
                }
                virusCategory={getCategoryNameById(publication.virusCategoryId)}
                region={publication.region}
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
