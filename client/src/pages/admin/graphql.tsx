import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Globe, RefreshCw, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { KotahiGroup, Settings } from '@shared/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiRequest } from '@/lib/queryClient'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Default queries to show if schema introspection fails
const defaultQueries = [
  {
    name: '🔍 GraphQL Schema Structure',
    query: `
query IntrospectionQuery {
  __schema {
    queryType {
      name
      fields {
        name
        description
        args {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
}`,
    variables: '{}',
    description: 'Introspects the schema structure of the GraphQL API.',
  },
  {
    name: '🔍 GraphQL Type Definitions',
    query: `
query GetTypes {
  __schema {
    types {
      name
      kind
      description
      fields {
        name
        description
      }
    }
  }
}`,
    variables: '{}',
    description: 'Lists all available types in the GraphQL schema.',
  },
  {
    name: '📄 Latest Manuscript',
    query: `
query LastManuscript {
  paginatedManuscripts(first: 1) {
    totalCount
    edges {
      node {
        id
        meta {
          title
          abstract
        }
        submission {
          id
          submitter {
            name
            email
          }
          status
        }
        created
        updated
      }
    }
  }
}`,
    variables: '{}',
    description: 'Fetches the latest manuscript from the database.',
  },
  {
    name: '📋 Filter Manuscripts by Status',
    query: `
query ManuscriptsByStatus($status: String!) {
  paginatedManuscripts(first: 5, filter: { status: $status }) {
    totalCount
    edges {
      node {
        id
        meta {
          title
        }
        submission {
          status
          submitter {
            name
          }
        }
        created
      }
    }
  }
}`,
    variables: `{
  "status": "submitted"
}`,
    description: 'Fetches manuscripts filtered by submission status.',
  },
  {
    name: '📝 Detailed Manuscript View',
    query: `
query ManuscriptDetails($id: ID!) {
  manuscript(id: $id) {
    id
    meta {
      title
      abstract
      keywords
    }
    submission {
      id
      status
      submitter {
        name
        email
      }
      reviews {
        id
        recommendation
        comments
        reviewer {
          name
        }
      }
    }
    files {
      id
      name
      url
      mimeType
    }
    created
    updated
  }
}`,
    variables: `{
  "id": "manuscript-1"
}`,
    description: 'Fetches detailed information about a specific manuscript.',
  },
]

const groupQuery = {
  query: `query groups {
			groups {
				id
				name
				configs {
					active
					flaxSiteUrl
				}
			}
		}`,
}

interface GraphQLType {
  name: string
  kind: string
  description?: string
  fields?: GraphQLField[]
}

interface GraphQLField {
  name: string
  description?: string
  type?: {
    name?: string
    kind?: string
    ofType?: {
      name?: string
      kind?: string
    }
  }
  args?: GraphQLArgument[]
}

interface GraphQLArgument {
  name: string
  description?: string
  type: {
    name?: string
    kind?: string
  }
}

interface DynamicQuery {
  name: string
  query: string
  variables: string
  description?: string
}

const formSchema = z.object({
  endpoint: z.string().url({ message: 'Endpoint must be a valid URL' }),
  apiKey: z.string().optional(),
  groupId: z.string().uuid({ message: 'Invalid Kotahi group' }),
})

type FormValues = z.infer<typeof formSchema>

export default function GraphQLAdmin() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // State for configuration
  //   const [endpoint, setEndpoint] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [groupId, setGroupId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('connection')
  const [schema, setSchema] = useState<any>(null)
  const [schemaTypes, setSchemaTypes] = useState<GraphQLType[]>([])
  const [schemaQueries, setSchemaQueries] = useState<GraphQLField[]>([])
  const [dynamicQueries, setDynamicQueries] =
    useState<DynamicQuery[]>(defaultQueries)

  // State for query execution
  const [query, setQuery] = useState<string>('')
  const [groups, setGroups] = useState<Array<KotahiGroup>>([])
  const [variables, setVariables] = useState<string>('{}')
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isValidEndpoint, setIsValidEndpoint] = useState<boolean>(false)
  const [isFetchingSchema, setIsFetchingSchema] = useState<boolean>(false)
  const [selectedQueryIndex, setSelectedQueryIndex] = useState<number>(0)
  const [isVerifyingEndpoint, setIsVerifyingEndpoint] = useState<boolean>(false)

  const { data: settings, isLoading: isSettingsQueryLoading } =
    useQuery<Settings>({ queryKey: ['/api/settings/kotahi'] })

  const updateKotahiSettings = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormValues }) => {
      const payload: Partial<Settings> = {
        formData: data,
      }

      return apiRequest(`/api/settings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/kotahi'] })
      toast({
        title: 'Success',
        description: 'Kotahi configuration saved successfully',
      })
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to save Kotahi configuration',
        variant: 'destructive',
      })
      console.error('Error saving Kotahi config:', error)
    },
    onSettled: (data, error, variables, context) => {
      setIsSaving(false)
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: '',
      apiKey: '',
      groupId: '',
    },
  })

  useEffect(() => {
    const loadGroups = async (apiEndpoint: string) => {
      const {
        data: { groups: groupsResult },
      } = await fetchGroups(apiEndpoint)

      setGroups(groupsResult)
    }

    if (!isSettingsQueryLoading && settings) {
      form.reset(settings.formData)

      if (settings.formData.endpoint) {
        loadGroups(settings.formData.endpoint)
      }
    }
  }, [form, settings])

  useEffect(() => {})

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Save configuration to localStorage
  const handleSaveConfig = (data: FormValues) => {
    setIsSaving(true)

    console.log('saving data', data)

    updateKotahiSettings.mutate({ id: settings?.id || -1, data })
  }

  // Handle query selection from dropdown
  const handleQuerySelection = (value: string) => {
    const index = parseInt(value)
    setSelectedQueryIndex(index)

    const selectedQuery = dynamicQueries[index]
    if (selectedQuery) {
      setQuery(selectedQuery.query)
      setVariables(selectedQuery.variables)
    }
  }

  const fetchGroups = async (endpoint: string) =>
    queryClient.fetchQuery({
      queryKey: ['kotahiGroups', endpoint],
      queryFn: async () =>
        apiRequest<{ data: { groups: KotahiGroup[] } }>(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groupQuery),
        }),
    })

  const handleVerifyEndpoint = async () => {
    setIsValidEndpoint(false)
    const { endpoint } = form.getValues()
    if (!endpoint) {
      toast({
        title: 'Error',
        description: 'Invalid endpoint',
      })

      return
    }

    try {
      const {
        data: { groups: groupsResult },
      } = await fetchGroups(endpoint)

      setIsValidEndpoint(true)

      console.log('got groupsResult', groupsResult)

      setGroups(groupsResult)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to verify endpoint',
        variant: 'destructive',
      })

      console.error('Failed to verify endpoint', err)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Globe className="mr-2 h-6 w-6" />
        <h1 className="text-3xl font-bold">GraphQL API Explorer</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="connection">API Configuration</TabsTrigger>
          {/* <TabsTrigger value="query">Query Explorer</TabsTrigger> */}
        </TabsList>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Kotahi GraphQL API Configuration</CardTitle>
              <CardDescription>
                Configure the connection to your Kotahi GraphQL API endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSaveConfig)}>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="endpoint"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>GraphQL Endpoint URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            <Button
                              disabled={isVerifyingEndpoint}
                              onClick={handleVerifyEndpoint}
                              type="button"
                            >
                              Check
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              The full URL of your Kotahi GraphQL API endpoint
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>

                    {isValidEndpoint && (
                      <div>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="groupId"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>Kotahi Group</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a group..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {groups?.map(group => (
                                        <SelectItem
                                          key={group.id}
                                          value={group.id}
                                        >
                                          {group.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                                <p className="text-sm text-muted-foreground">
                                  Specify a Group ID for Kotahi team access
                                </p>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="apiKey"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel>API Key (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                                <p className="text-sm text-muted-foreground">
                                  If the API requires authentication, provide
                                  your access token or API key
                                </p>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <Button disabled={isSaving} type="submit">
                      {isSaving
                        ? 'Saving Configuration...'
                        : 'Save Configuration'}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle>GraphQL Query Explorer</CardTitle>
              <CardDescription>
                Execute GraphQL queries against the Kotahi API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!form.getValues().endpoint && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>
                      Please configure your GraphQL endpoint in the{' '}
                      <span className="font-semibold">API Configuration</span>{' '}
                      tab first.
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">API Schema</h3>
                      <p className="text-sm text-muted-foreground">
                        {schema
                          ? `${schemaQueries.length} API queries available`
                          : 'No schema loaded yet'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      //   onClick={fetchSchema}
                      //   disabled={isFetchingSchema || !endpoint}
                    >
                      {isFetchingSchema ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading Schema...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Schema
                        </>
                      )}
                    </Button>
                  </div>

                  {schema && (
                    <div className="space-y-1 py-2">
                      <Badge variant="outline" className="mr-1">
                        {dynamicQueries.length} Queries
                      </Badge>
                      {schemaTypes.length > 0 && (
                        <Badge variant="outline">
                          {schemaTypes.length} Types
                        </Badge>
                      )}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="predefinedQuery">
                        Available Example Queries
                      </Label>
                      <Select
                        value={selectedQueryIndex.toString()}
                        onValueChange={handleQuerySelection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a query" />
                        </SelectTrigger>
                        <SelectContent>
                          {dynamicQueries.map(
                            (q: DynamicQuery, index: number) => (
                              <SelectItem key={index} value={index.toString()}>
                                {q.name}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      {dynamicQueries[selectedQueryIndex]?.description && (
                        <p className="text-sm text-muted-foreground">
                          {dynamicQueries[selectedQueryIndex].description}
                        </p>
                      )}
                    </div>

                    <div>
                      <Button
                        variant="secondary"
                        // onClick={executeQuery}
                        // disabled={isLoading || !endpoint}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running example query...
                          </>
                        ) : (
                          'Run Selected Example Query'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="query">GraphQL Query</Label>
                  <Textarea
                    id="query"
                    rows={10}
                    className="font-mono"
                    placeholder="Enter your GraphQL query"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variables">Query Variables (JSON)</Label>
                  <Textarea
                    id="variables"
                    rows={3}
                    className="font-mono"
                    placeholder="{}"
                    value={variables}
                    onChange={e => setVariables(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter query variables as a JSON object
                  </p>
                </div>

                <Button
                  // onClick={executeQuery}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    'Execute Query'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {(response || error) && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Query Response</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4 whitespace-pre-wrap font-mono text-sm">
                    {error}
                  </div>
                )}

                {response && (
                  <pre className="bg-gray-50 p-4 rounded border overflow-auto max-h-96 text-sm">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
