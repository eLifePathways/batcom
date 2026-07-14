import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Publication, VirusCategory } from '@shared/schema'
import HeroSection from '@/components/sections/hero-section'
import PublicationCard from '@/components/ui/publication-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import { EvidenceInfection, Region } from '@shared/constants'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const {
    data: publications,
    isLoading,
    error,
  } = useQuery<Publication[]>({
    queryKey: ['/api/publications', { query: { searchQuery: submittedQuery } }],
    enabled: submittedQuery.length > 0,
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey
      const queryParams = params as { query: string }
      const response = await fetch(
        `${url}?query=${encodeURIComponent(queryParams.query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('Search request failed')
      }

      return response.json()
    },
  })

  const { data: categories } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim())
    }
  }

  const getCategoryNameById = (id: number): string => {
    const category = categories?.find(cat => cat.id === id)
    return category?.name || 'Unknown'
  }

  return (
    <main className="container mx-auto px-4">
      <HeroSection
        title="Search Our Reviews"
        description="Find specific research papers and reviews on bat virus spillover events by searching our comprehensive database."
      />
      <div className="border-b border-border mb-10"></div>

      <div>
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search by title, author, or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </form>
        </div>

        {submittedQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {isLoading
                ? 'Searching...'
                : `Search results for "${submittedQuery}"`}
            </h2>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded">
                An error occurred while searching. Please try again.
              </div>
            )}

            {!isLoading && publications && publications.length === 0 && (
              <div className="bg-muted border border-border px-4 py-8 rounded text-center">
                <p className="text-muted-foreground mb-4">
                  No results found for your search query.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try using different keywords or browse our publications by
                  category.
                </p>
              </div>
            )}

            {!isLoading && publications && publications.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {publications.map(publication => (
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
                    link={publication.link || undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!submittedQuery && (
          <div className="text-center bg-muted rounded-lg py-12 px-4">
            <h3 className="text-xl font-medium text-foreground mb-4">
              Start your search
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter keywords related to bat virus research, specific virus
              families, or geographic regions to find relevant publications in
              our database.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default Search
