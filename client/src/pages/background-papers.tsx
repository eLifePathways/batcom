import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import HeroSection from '@/components/sections/hero-section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocation } from 'wouter'
import { HeroSectionSettings } from '@shared/schema'

interface BackgroundPaper {
  id: number
  title: string
  virusCategoryId: number
  link?: string
  imageUrl?: string
  description?: string
}

interface VirusCategory {
  id: number
  name: string
  description: string
  imageUrl: string
}

// Paper card component
const PaperCard = ({
  paper,
  category,
}: {
  paper: BackgroundPaper
  category?: VirusCategory
}) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold line-clamp-2 text-primary mb-1">
              {paper.title}
            </CardTitle>
            {category && (
              <CardDescription className="text-sm flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/70 inline-block"></div>
                {category.name}
              </CardDescription>
            )}
          </div>
          {paper.imageUrl && (
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded">
              <img
                src={paper.imageUrl}
                alt="Bat visual"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!paper.imageUrl && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-primary/70" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-3 flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {paper.description ||
            'This background paper provides essential context for understanding bat-borne viruses and their potential for human spillover.'}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        {paper.link ? (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1"
            >
              Read Paper
              <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full opacity-70"
            disabled
          >
            Coming Soon
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// Loading skeleton
const PaperCardSkeleton = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="pb-2">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-3 w-[120px]" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="pb-2 pt-2">
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </CardContent>
    <CardFooter className="pt-2">
      <Skeleton className="h-8 w-full" />
    </CardFooter>
  </Card>
)

export default function BackgroundPapers() {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [location] = useLocation()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const category = searchParams.get('category')

    if (category) {
      setActiveTab(category)
    }
  }, [location])

  // Fetch background papers
  const { data: papers, isLoading: papersLoading } = useQuery<
    BackgroundPaper[]
  >({
    queryKey: ['/api/background-papers'],
    staleTime: 1000 * 60 * 5,
  })

  // Fetch virus categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    VirusCategory[]
  >({
    queryKey: ['/api/virus-categories'],
    staleTime: 1000 * 60 * 5,
  })

  const { data: heroSectionData, isLoading: heroSectionLoading } =
    useQuery<HeroSectionSettings>({
      queryKey: ['/api/hero-section/backgroundPapers'],
    })

  const isLoading = papersLoading || categoriesLoading

  // Filter papers by virus category and sort by ID
  const filteredPapers = papers
    ? [...papers]
        .sort((a, b) => a.id - b.id)
        .filter((paper: BackgroundPaper) => {
          if (activeTab === 'all') return true
          return paper.virusCategoryId === parseInt(activeTab)
        })
    : []

  // Get category name for a paper
  const getCategoryForPaper = (paper: BackgroundPaper) => {
    return categories?.find(
      (cat: VirusCategory) => cat.id === paper.virusCategoryId,
    )
  }

  const papersByCategory = useMemo(() => {
    if (!papers) return {}
    return papers.reduce(
      (acc, paper) => {
        const catName = getCategoryForPaper(paper)?.name ?? 'Other/Unknown'
        if (!acc[catName]) acc[catName] = []
        acc[catName].push(paper)
        return acc
      },
      {} as Record<string, BackgroundPaper[]>,
    )
  }, [papers])

  const { description = '', title = '' } = heroSectionData ?? {}

  return (
    <main className="container mx-auto px-4">
      <HeroSection title={title} description={description} />
      {/* <div className="border-b border-gray-200 dark:border-gray-700 mb-10"></div> */}

      {isLoading && (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-40 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading &&
      papersByCategory &&
      Object.keys(papersByCategory).length > 0 ? (
        <div className="space-y-8 pb-8">
          {Object.entries(papersByCategory).map(([category, papers]) => (
            <section key={category}>
              <h2 className="text-xl font-semibold text-primary mb-4 border-b border-gray-300 pb-2">
                {category}
              </h2>
              <ul className="list-decimal list-inside space-y-3 pl-2">
                {papers.map((paper: BackgroundPaper, index: number) => (
                  <li
                    key={paper.id}
                    className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    {/* <span className="font-medium">{paper.authors}</span>.{' '} */}
                    <span className="italic">{paper.title}</span>.{' '}
                    {/* <span>{paper.year ? `(${paper.})` : ''}</span>{' '} */}
                    {paper.link ? (
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        [Full Paper]
                      </a>
                    ) : (
                      // : paper.abstractLink ? (
                      //   <a
                      //     href={paper.abstractLink}
                      //     target="_blank"
                      //     rel="noopener noreferrer"
                      //     className="text-blue-600 hover:underline ml-1"
                      //   >
                      //     [Abstract]
                      //   </a>
                      // )
                      <span className="text-gray-400 ml-1">
                        [Link unavailable]
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No background papers found.</p>
          </div>
        )
      )}
    </main>
  )
}
