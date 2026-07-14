import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HeroSection from '@/components/sections/hero-section'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { HeroSectionSettings } from '@shared/schema'

// Types for What We Do content
interface WhatWeDoSection {
  id: number
  title: string
  subtitle: string | null
  description: string | null
  imageUrl: string | null
  slug: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface WhatWeDoContent {
  id: number
  sectionId: number
  title: string | null
  contentType: string
  content: string
  sortOrder: number
  metadata: any
  createdAt: string
  updatedAt: string
}

// Content Renderer Component
const ContentRenderer = ({ content }: { content: WhatWeDoContent }) => {
  const metadata = content.metadata
    ? typeof content.metadata === 'string'
      ? JSON.parse(content.metadata)
      : content.metadata
    : null

  switch (content.contentType) {
    case 'text':
      return (
        <div className="mb-8">
          {content.title && (
            <h3 className="text-xl font-semibold text-primary mb-3">
              {content.title}
            </h3>
          )}
          <p className="text-foreground">{content.content}</p>
        </div>
      )
    case 'image':
      return (
        <div className="mb-8">
          {content.title && (
            <h3 className="text-xl font-semibold text-primary mb-3">
              {content.title}
            </h3>
          )}
          <div className="relative">
            <img
              src={content.content}
              alt={metadata?.altText || content.title || 'Research image'}
              className="rounded-lg w-full"
            />
            {metadata?.caption && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                {metadata.caption}
              </p>
            )}
          </div>
        </div>
      )
    case 'heading':
      return (
        <h3 className="text-2xl font-semibold text-primary mb-4">
          {content.content}
        </h3>
      )
    case 'list':
      if (metadata?.items && Array.isArray(metadata.items)) {
        return (
          <div className="mb-8">
            {content.title && (
              <h3 className="text-xl font-semibold text-primary mb-3">
                {content.title}
              </h3>
            )}
            <ul className="list-disc pl-5 space-y-2 text-foreground">
              {metadata.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )
      }
      return null
    default:
      return <p className="text-foreground">{content.content}</p>
  }
}

// Section content component
const SectionContent = ({ sectionId }: { sectionId: number }) => {
  const {
    data: contentItems = [],
    isLoading,
    error,
  } = useQuery<WhatWeDoContent[]>({
    queryKey: ['/api/what-we-do/content/section', sectionId],
    enabled: !!sectionId,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive">Error loading content</p>
  }

  return (
    <div className="space-y-4">
      {contentItems.map(item => (
        <ContentRenderer key={item.id} content={item} />
      ))}
    </div>
  )
}

export default function WhatWeDo() {
  // Fetch What We Do sections
  const {
    data: sections = [],
    isLoading,
    error,
  } = useQuery<WhatWeDoSection[]>({
    queryKey: ['/api/what-we-do/sections'],
  })

  const { data: heroSectionData, isLoading: heroSectionLoading } =
    useQuery<HeroSectionSettings>({ queryKey: ['/api/hero-section/whatWeDo'] })

  const [activeTab, setActiveTab] = useState<string>('')

  // Set the first section as active when data loads
  useEffect(() => {
    if (sections.length > 0 && !activeTab) {
      setActiveTab(sections[0].slug)
    }
  }, [sections, activeTab])

  const { description = '', title = '' } = heroSectionData ?? {}

  return (
    <main className="container mx-auto px-4 pb-8">
      <HeroSection
        title={title}
        loading={heroSectionLoading}
        description={description}
      />
      <div className="border-b border-border mb-10"></div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              There was a problem loading the content. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : sections && sections.length > 0 ? (
        <div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className={`grid grid-cols-2 md:grid-cols-${Math.min(sections.length, 5)} w-full`}
            >
              {sections.map((section: WhatWeDoSection) => (
                <TabsTrigger key={section.id} value={section.slug}>
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <Card className="mt-6">
              {sections.map((section: WhatWeDoSection) => (
                <TabsContent key={section.id} value={section.slug}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                    {section.subtitle && (
                      <CardDescription className="text-lg">
                        {section.subtitle}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {section.description && (
                      <p className="text-foreground mb-6">
                        {section.description}
                      </p>
                    )}
                    {section.imageUrl && (
                      <div className="mb-6">
                        <img
                          src={section.imageUrl}
                          alt={section.title}
                          className="rounded-lg w-full max-h-[300px] object-cover"
                        />
                      </div>
                    )}
                    <SectionContent sectionId={section.id} />
                  </CardContent>
                </TabsContent>
              ))}
            </Card>
          </Tabs>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Content Available</CardTitle>
            <CardDescription>
              The "What We Do" section content is currently being updated.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  )
}
