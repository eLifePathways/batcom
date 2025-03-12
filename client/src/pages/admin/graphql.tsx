import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for GraphQL API configuration
const graphqlConfigSchema = z.object({
  endpoint: z.string().url("Please enter a valid URL"),
  apiKey: z.string().optional(),
});

// Schema for GraphQL query
const querySchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  variables: z.string().optional(),
});

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
  const [endpoint, setEndpoint] = useState("");
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Form for API configuration
  const configForm = useForm<z.infer<typeof graphqlConfigSchema>>({
    resolver: zodResolver(graphqlConfigSchema),
    defaultValues: {
      endpoint: "",
      apiKey: "",
    },
  });

  // Form for GraphQL query
  const queryForm = useForm<z.infer<typeof querySchema>>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      query: predefinedQueries[0].query,
      variables: predefinedQueries[0].variables,
    },
  });

  // Handle API config submission
  const onConfigSubmit = (data: z.infer<typeof graphqlConfigSchema>) => {
    setEndpoint(data.endpoint);
    toast({
      title: "API Configuration Saved",
      description: "Your GraphQL API endpoint has been configured.",
    });
    setActiveTab("query");
  };

  // Handle query selection
  const handleQuerySelection = (index: string) => {
    const queryIndex = parseInt(index);
    setSelectedQueryIndex(queryIndex);
    queryForm.setValue("query", predefinedQueries[queryIndex].query);
    queryForm.setValue("variables", predefinedQueries[queryIndex].variables);
  };

  // Execute GraphQL query
  const executeQuery = async (data: z.infer<typeof querySchema>) => {
    if (!endpoint) {
      toast({
        title: "API Endpoint Required",
        description: "Please configure the GraphQL API endpoint first.",
        variant: "destructive",
      });
      setActiveTab("connection");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Parse variables if provided
      const variables = data.variables ? JSON.parse(data.variables) : {};
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(configForm.getValues("apiKey") ? {
            "Authorization": `Bearer ${configForm.getValues("apiKey")}`
          } : {})
        },
        body: JSON.stringify({
          query: data.query,
          variables
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
        <h1 className="text-3xl font-bold mb-6">GraphQL API Explorer</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="connection">API Configuration</TabsTrigger>
            <TabsTrigger value="query" disabled={!endpoint}>Query Explorer</TabsTrigger>
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
                <Form {...configForm}>
                  <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-4">
                    <FormField
                      control={configForm.control}
                      name="endpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GraphQL Endpoint URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.kotahi.example.com/graphql" {...field} />
                          </FormControl>
                          <FormDescription>
                            The full URL of your Kotahi GraphQL API endpoint
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={configForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key (Optional)</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Your API key" {...field} />
                          </FormControl>
                          <FormDescription>
                            If the API requires authentication, provide your access token or API key
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Save Configuration</Button>
                  </form>
                </Form>
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
                <div className="mb-4">
                  <FormLabel>Predefined Queries</FormLabel>
                  <Select 
                    value={selectedQueryIndex.toString()} 
                    onValueChange={handleQuerySelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a predefined query" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedQueries.map((query, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {query.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Form {...queryForm}>
                  <form onSubmit={queryForm.handleSubmit(executeQuery)} className="space-y-4">
                    <FormField
                      control={queryForm.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GraphQL Query</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={10}
                              className="font-mono"
                              placeholder="Enter your GraphQL query"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={queryForm.control}
                      name="variables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Query Variables (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              className="font-mono"
                              placeholder="{}"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter query variables as a JSON object
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Executing...
                        </>
                      ) : "Execute Query"}
                    </Button>
                  </form>
                </Form>
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