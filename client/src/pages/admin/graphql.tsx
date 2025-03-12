import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

// Predefined queries
const predefinedQueries = [
  {
    name: "List Manuscripts",
    query: `
query {
  manuscripts {
    edges {
      node {
        id
        title
        status
      }
    }
  }
}`,
    variables: "{}"
  },
  {
    name: "User Profile",
    query: `
query {
  currentUser {
    id
    username
    email
    defaultIdentity {
      id
      name
      email
    }
  }
}`,
    variables: "{}"
  },
  {
    name: "Journal Details",
    query: `
query {
  journal {
    id
    name
    description
    manuscriptTypes {
      id
      name
      description
    }
  }
}`,
    variables: "{}"
  }
];

export default function GraphQLAdmin() {
  const [activeTab, setActiveTab] = useState("connection");
  const [endpoint, setEndpoint] = useState("https://kotahi-instance.example.org/graphql");
  const [apiKey, setApiKey] = useState("");
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [query, setQuery] = useState(predefinedQueries[0].query);
  const [variables, setVariables] = useState(predefinedQueries[0].variables);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setResponse(null);
    setError(null);
  };

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
    setQuery(predefinedQueries[queryIndex].query);
    setVariables(predefinedQueries[queryIndex].variables);
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
      
      // Build request headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      // Add authorization header if API key is provided
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          variables: parsedVariables
        })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        setError(result.errors.map((e: any) => e.message).join("\n"));
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
                  <div className="space-y-2">
                    <Label htmlFor="predefinedQuery">Predefined Queries</Label>
                    <Select 
                      value={selectedQueryIndex.toString()} 
                      onValueChange={handleQuerySelection}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a predefined query" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedQueries.map((q, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {q.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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