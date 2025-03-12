import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout";
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
      }
    }
  }
}`,
    variables: "{}"
  }
];

// Type definitions for schema information
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
  // Load previously saved endpoint from localStorage if available
  const savedEndpoint = typeof window !== 'undefined' ? localStorage.getItem('graphql_endpoint') || '' : '';
  
  const [activeTab, setActiveTab] = useState("connection");
  const [endpoint, setEndpoint] = useState(savedEndpoint);
  const [apiKey, setApiKey] = useState("");
  const [schema, setSchema] = useState<any>(null);
  const [schemaTypes, setSchemaTypes] = useState<GraphQLType[]>([]);
  const [schemaQueries, setSchemaQueries] = useState<GraphQLField[]>([]);
  const [dynamicQueries, setDynamicQueries] = useState<DynamicQuery[]>(defaultQueries);
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [query, setQuery] = useState(defaultQueries[0].query);
  const [variables, setVariables] = useState(defaultQueries[0].variables);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSchema, setIsFetchingSchema] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Introspect the GraphQL schema when the endpoint changes or when requested
  const fetchSchema = async () => {
    if (!endpoint || !endpoint.startsWith('http')) {
      toast({
        title: "Invalid API Endpoint",
        description: "Please configure a valid GraphQL API endpoint first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsFetchingSchema(true);
    setError(null);
    
    try {
      const introspectionQuery = `
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
            }
          }
        }
      }`;
      
      // Build request headers
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      
      // Use our proxy endpoint
      const response = await fetch('/api/graphql-proxy', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          endpoint,
          query: introspectionQuery,
          variables: {},
          headers
        })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        const errorMessage = Array.isArray(result.errors) 
          ? result.errors.map((e: any) => e.message).join("\n") 
          : result.error || "Failed to fetch schema";
          
        setError(`Schema introspection failed: ${errorMessage}`);
        toast({
          title: "Schema Introspection Failed",
          description: "Could not fetch the GraphQL schema. Using default queries instead.",
          variant: "destructive",
        });
      } else if (result.data && result.data.__schema) {
        setSchema(result.data.__schema);
        
        // Extract query fields
        const queryFields = result.data.__schema.queryType.fields || [];
        setSchemaQueries(queryFields);
        
        // Extract types
        const types = result.data.__schema.types || [];
        setSchemaTypes(types.filter((type: GraphQLType) => 
          !type.name.startsWith('__') && 
          type.kind !== 'SCALAR' && 
          type.kind !== 'INPUT_OBJECT'
        ));
        
        // Generate dynamic queries based on the schema
        const generatedQueries = generateQueriesFromSchema(queryFields, types);
        if (generatedQueries.length > 0) {
          setDynamicQueries(generatedQueries);
          setSelectedQueryIndex(0);
          setQuery(generatedQueries[0].query);
          setVariables(generatedQueries[0].variables);
          
          toast({
            title: "Schema Loaded",
            description: `Generated ${generatedQueries.length} queries from the GraphQL schema.`,
          });
        }
      }
    } catch (err) {
      setError(`Failed to fetch schema: ${err instanceof Error ? err.message : "Unknown error"}`);
      toast({
        title: "Error Fetching Schema",
        description: "An error occurred while fetching the schema. Using default queries instead.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingSchema(false);
    }
  };
  
  // Generate useful queries based on the schema
  const generateQueriesFromSchema = (
    queryFields: GraphQLField[], 
    types: GraphQLType[]
  ): DynamicQuery[] => {
    const queries: DynamicQuery[] = [];
    
    // First, add the introspection query
    queries.push(defaultQueries[0]);
    
    // For each query field, generate a basic query
    queryFields.forEach(field => {
      // Skip internal fields
      if (field.name.startsWith('__')) return;
      
      // Get the return type
      const returnTypeName = field.type?.name || field.type?.ofType?.name;
      if (!returnTypeName) return;
      
      // Find the corresponding type in the schema
      const returnType = types.find(t => t.name === returnTypeName);
      
      // Generate a query based on the type
      let queryString = `query Get${field.name.charAt(0).toUpperCase() + field.name.slice(1)} {\n  ${field.name}`;
      
      // Add arguments if they exist
      if (field.args && field.args.length > 0) {
        queryString += `(`;
        // We'll just include argument placeholders
        queryString += field.args.map(arg => {
          return `${arg.name}: $${arg.name}`;
        }).join(', ');
        queryString += `)`;
      }
      
      // Check if this is a connection/edge type (common in GraphQL APIs)
      const isConnection = returnTypeName.endsWith('Connection') || 
                           returnType?.fields?.some(f => f.name === 'edges' || f.name === 'nodes');
                           
      if (isConnection) {
        queryString += ` {\n    edges {\n      node {\n        id\n`;
        
        // Add a few common fields from the node type
        queryString += `        # Add the fields you want to retrieve\n`;
        queryString += `      }\n    }\n  }\n}`;
      } else if (returnType && returnType.fields) {
        // For non-connection types, include some of the fields
        queryString += ` {\n`;
        
        // Always include ID if available
        const hasId = returnType.fields.some(f => f.name === 'id');
        if (hasId) {
          queryString += `    id\n`;
        }
        
        // Include a few other common fields
        const commonFields = ['name', 'title', 'description', 'type', 'status'];
        commonFields.forEach(fieldName => {
          if (returnType.fields?.some(f => f.name === fieldName)) {
            queryString += `    ${fieldName}\n`;
          }
        });
        
        // Close the query
        queryString += `    # Add more fields as needed\n  }\n}`;
      } else {
        // Simple scalar return type
        queryString += `\n}`;
      }
      
      // Generate variables object if needed
      let variablesString = "{}";
      if (field.args && field.args.length > 0) {
        const varsObj: Record<string, any> = {};
        field.args.forEach(arg => {
          // Add placeholder based on type
          if (arg.type.kind === 'SCALAR') {
            switch(arg.type.name) {
              case 'Int':
                varsObj[arg.name] = 1;
                break;
              case 'Float':
                varsObj[arg.name] = 1.0;
                break;
              case 'Boolean':
                varsObj[arg.name] = false;
                break;
              case 'ID':
                varsObj[arg.name] = "id123";
                break;
              default:
                varsObj[arg.name] = "";
            }
          } else {
            varsObj[arg.name] = null;
          }
        });
        variablesString = JSON.stringify(varsObj, null, 2);
      }
      
      // Add the query to our collection
      queries.push({
        name: `Query ${field.name}`,
        query: queryString,
        variables: variablesString,
        description: field.description
      });
    });
    
    return queries;
  };
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setResponse(null);
    setError(null);
  };

  // Effect to fetch schema when endpoint changes
  useEffect(() => {
    // When component first mounts and has a valid endpoint
    if (endpoint && endpoint.startsWith('http')) {
      // Auto-fetch schema when component loads with a valid endpoint
      fetchSchema();
    }
  }, [endpoint]); // Re-run when endpoint changes
  
  // Handle API config submission
  const handleSaveConfig = () => {
    if (!endpoint || !endpoint.startsWith('http')) {
      toast({
        title: "Invalid API Endpoint",
        description: "Please enter a valid URL for the GraphQL API endpoint.",
        variant: "destructive",
      });
      return;
    }
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('graphql_endpoint', endpoint);
    } catch (error) {
      console.error('Failed to save endpoint to localStorage:', error);
    }
    
    // Fetch schema from the endpoint
    fetchSchema();
    
    toast({
      title: "API Configuration Saved",
      description: "Your GraphQL API endpoint has been configured.",
    });
    
    handleTabChange("query");
  };

  // Handle query selection
  const handleQuerySelection = (index: string) => {
    const queryIndex = parseInt(index);
    setSelectedQueryIndex(queryIndex);
    setQuery(dynamicQueries[queryIndex].query);
    setVariables(dynamicQueries[queryIndex].variables);
  };

  // Execute GraphQL query
  const executeQuery = async () => {
    if (!endpoint) {
      toast({
        title: "API Endpoint Required",
        description: "Please configure the GraphQL API endpoint first.",
        variant: "destructive",
      });
      handleTabChange("connection");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Safely parse variables if provided
      let parsedVariables = {};
      if (variables) {
        try {
          parsedVariables = JSON.parse(variables);
        } catch (parseError) {
          setError("Invalid JSON in variables field");
          setIsLoading(false);
          return;
        }
      }
      
      // Build request headers for the target GraphQL API
      const headers: Record<string, string> = {};
      
      // Add authorization header if API key is provided
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      
      // Use our proxy endpoint instead of calling the GraphQL endpoint directly
      // This avoids CORS issues and network errors
      const response = await fetch('/api/graphql-proxy', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          endpoint,        // Pass the target GraphQL endpoint
          query,           // The GraphQL query
          variables: parsedVariables, // The variables
          headers          // Headers to be applied to the target request
        })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        setError(Array.isArray(result.errors) 
          ? result.errors.map((e: any) => e.message).join("\n") 
          : result.error || "Unknown error occurred");
      }
      
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
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
    </AdminLayout>
  );
}