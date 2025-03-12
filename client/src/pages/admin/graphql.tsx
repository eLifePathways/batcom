import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Default queries to show if schema introspection fails
const defaultQueries = [
  {
    name: "Schema Introspection",
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
    variables: "{}",
    description: "Introspects the schema structure of the GraphQL API."
  },
  {
    name: "Get Types",
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
    variables: "{}",
    description: "Lists all available types in the GraphQL schema."
  }
];

interface GraphQLType {
  name: string;
  kind: string;
  description?: string;
  fields?: GraphQLField[];
}

interface GraphQLField {
  name: string;
  description?: string;
  type?: {
    name?: string;
    kind?: string;
    ofType?: {
      name?: string;
      kind?: string;
    };
  };
  args?: GraphQLArgument[];
}

interface GraphQLArgument {
  name: string;
  description?: string;
  type: {
    name?: string;
    kind?: string;
  };
}

interface DynamicQuery {
  name: string;
  query: string;
  variables: string;
  description?: string;
}

export default function GraphQLAdmin() {
  const { toast } = useToast();
  
  // State for configuration
  const [endpoint, setEndpoint] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("connection");
  const [schema, setSchema] = useState<any>(null);
  const [schemaTypes, setSchemaTypes] = useState<GraphQLType[]>([]);
  const [schemaQueries, setSchemaQueries] = useState<GraphQLField[]>([]);
  const [dynamicQueries, setDynamicQueries] = useState<DynamicQuery[]>(defaultQueries);
  
  // State for query execution
  const [query, setQuery] = useState<string>("");
  const [variables, setVariables] = useState<string>("{}");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingSchema, setIsFetchingSchema] = useState<boolean>(false);
  const [selectedQueryIndex, setSelectedQueryIndex] = useState<number>(0);
  
  // Load config from localStorage on initial render
  useEffect(() => {
    const savedEndpoint = localStorage.getItem("graphql_endpoint");
    const savedApiKey = localStorage.getItem("graphql_api_key");
    
    if (savedEndpoint) {
      setEndpoint(savedEndpoint);
    }
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    // If endpoint is available, fetch schema
    if (savedEndpoint && savedEndpoint.startsWith('http')) {
      fetchSchema();
    }
  }, []);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Save configuration to localStorage
  const handleSaveConfig = () => {
    localStorage.setItem("graphql_endpoint", endpoint);
    localStorage.setItem("graphql_api_key", apiKey);
    
    toast({
      title: "Configuration Saved",
      description: "Your GraphQL API configuration has been saved.",
    });
    
    if (endpoint) {
      fetchSchema();
      setActiveTab("query");
    }
  };
  
  // Fetch schema from GraphQL endpoint
  const fetchSchema = async () => {
    setIsFetchingSchema(true);
    setError(null);
    
    try {
      const response = await fetch("/api/graphql-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
                types {
                  name
                  kind
                  description
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
            }
          `,
          variables: {},
          endpoint: endpoint,
          apiKey: apiKey
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || "Failed to fetch schema");
      }
      
      const schemaData = data.data.__schema;
      setSchema(schemaData);
      
      // Extract query fields
      const queryFields = schemaData.queryType.fields || [];
      setSchemaQueries(queryFields);
      
      // Filter relevant types
      const types = schemaData.types.filter((type: GraphQLType) => 
        !type.name.startsWith("__") && 
        ["OBJECT", "INTERFACE", "ENUM", "SCALAR"].includes(type.kind)
      );
      setSchemaTypes(types);
      
      // Generate dynamic queries from schema
      const generatedQueries = queryFields.map((field: GraphQLField) => {
        // Generate argument variables
        const argVariables: Record<string, any> = {};
        let argString = "";
        
        if (field.args && field.args.length > 0) {
          argString = "(" + field.args.map(arg => {
            const argName = arg.name;
            argVariables[argName] = null;
            return `$${argName}: ${arg.type.name || "String"}`;
          }).join(", ") + ")";
        }
        
        // Create query
        return {
          name: field.name,
          description: field.description || `Query ${field.name} from the API`,
          query: `query ${field.name.charAt(0).toUpperCase() + field.name.slice(1)}${argString} {
  ${field.name} {
    id
    # Add fields you want to retrieve
  }
}`,
          variables: JSON.stringify(argVariables, null, 2)
        };
      });
      
      // Combine with default queries
      setDynamicQueries([...defaultQueries, ...generatedQueries]);
      
      toast({
        title: "Schema Loaded",
        description: `Successfully loaded schema with ${queryFields.length} queries and ${types.length} types.`,
      });
      
    } catch (error: any) {
      console.error("Error fetching schema:", error);
      setError(error.message || "Failed to fetch schema");
      toast({
        title: "Error",
        description: `Failed to load schema: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsFetchingSchema(false);
    }
  };
  
  // Handle query selection from dropdown
  const handleQuerySelection = (value: string) => {
    const index = parseInt(value);
    setSelectedQueryIndex(index);
    
    const selectedQuery = dynamicQueries[index];
    if (selectedQuery) {
      setQuery(selectedQuery.query);
      setVariables(selectedQuery.variables);
    }
  };
  
  // Execute GraphQL query
  const executeQuery = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      // Validate JSON
      const parsedVariables = variables ? JSON.parse(variables) : {};
      
      const response = await fetch("/api/graphql-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: parsedVariables,
          endpoint,
          apiKey
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || "Query execution failed");
      }
      
      setResponse(data);
      
    } catch (error: any) {
      console.error("Error executing query:", error);
      setError(error.message || "Failed to execute query");
      toast({
        title: "Error",
        description: `Query execution failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Globe className="mr-2 h-6 w-6" />
        <h1 className="text-3xl font-bold">GraphQL API Explorer</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="connection">API Configuration</TabsTrigger>
          <TabsTrigger value="query" disabled={!endpoint || !endpoint.startsWith('http')}>Query Explorer</TabsTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="endpoint">GraphQL Endpoint URL</Label>
                  <Input 
                    id="endpoint"
                    placeholder="https://api.kotahi.example.com/graphql" 
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The full URL of your Kotahi GraphQL API endpoint
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (Optional)</Label>
                  <Input 
                    id="apiKey"
                    type="password" 
                    placeholder="Your API key" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    If the API requires authentication, provide your access token or API key
                  </p>
                </div>
                
                <Button onClick={handleSaveConfig}>Save Configuration</Button>
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
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">API Schema</h3>
                      <p className="text-sm text-muted-foreground">
                        {schema ? 
                          `${schemaQueries.length} API queries available` : 
                          "No schema loaded yet"}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchSchema} 
                      disabled={isFetchingSchema || !endpoint}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="predefinedQuery">Available Queries</Label>
                    <Select 
                      value={selectedQueryIndex.toString()} 
                      onValueChange={handleQuerySelection}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a query" />
                      </SelectTrigger>
                      <SelectContent>
                        {dynamicQueries.map((q: DynamicQuery, index: number) => (
                          <SelectItem key={index} value={index.toString()}>
                            {q.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {dynamicQueries[selectedQueryIndex]?.description && (
                      <p className="text-sm text-muted-foreground">
                        {dynamicQueries[selectedQueryIndex].description}
                      </p>
                    )}
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
                    onChange={(e) => setQuery(e.target.value)}
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
                    onChange={(e) => setVariables(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter query variables as a JSON object
                  </p>
                </div>
                
                <Button onClick={executeQuery} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : "Execute Query"}
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
  );
}