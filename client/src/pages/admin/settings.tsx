import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminNav from "@/components/admin/admin-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Palette, Shield, User, Mail, Database } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  
  // Website Settings
  const [websiteSettings, setWebsiteSettings] = useState({
    siteName: "Bat-Com Research Group",
    siteDescription: "Research on bat-borne virus spillover",
    contactEmail: "info@batcom.org",
    allowRegistration: true,
    maintenanceMode: false,
    theme: "default",
  });
  
  // API Settings
  const [apiSettings, setAPISettings] = useState({
    apiRateLimit: "100",
    enablePublicAPI: true,
    requireAPIKey: false,
  });
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    adminLoginAttempts: "5",
    sessionTimeout: "60",
    enableTwoFactor: false,
  });
  
  // Update website settings handler
  const handleWebsiteSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setWebsiteSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  // Update API settings handler
  const handleAPISettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAPISettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  // Update security settings handler
  const handleSecuritySettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (settingType: string, name: string, checked: boolean) => {
    if (settingType === "website") {
      setWebsiteSettings(prev => ({ ...prev, [name]: checked }));
    } else if (settingType === "api") {
      setAPISettings(prev => ({ ...prev, [name]: checked }));
    } else if (settingType === "security") {
      setSecuritySettings(prev => ({ ...prev, [name]: checked }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (settingType: string, name: string, value: string) => {
    if (settingType === "website") {
      setWebsiteSettings(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Save website settings mutation
  const saveWebsiteSettings = useMutation({
    mutationFn: async (data: any) => {
      // In a real application, you would save to an API endpoint
      console.log("Saving website settings:", data);
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Website settings saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save website settings",
        variant: "destructive",
      });
      console.error("Error saving settings:", error);
    },
  });
  
  // Save API settings mutation
  const saveAPISettings = useMutation({
    mutationFn: async (data: any) => {
      // In a real application, you would save to an API endpoint
      console.log("Saving API settings:", data);
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API settings saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save API settings",
        variant: "destructive",
      });
      console.error("Error saving settings:", error);
    },
  });
  
  // Save security settings mutation
  const saveSecuritySettings = useMutation({
    mutationFn: async (data: any) => {
      // In a real application, you would save to an API endpoint
      console.log("Saving security settings:", data);
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Security settings saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive",
      });
      console.error("Error saving settings:", error);
    },
  });
  
  // Handle form submissions
  const handleWebsiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebsiteSettings.mutate(websiteSettings);
  };
  
  const handleAPISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAPISettings.mutate(apiSettings);
  };
  
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSecuritySettings.mutate(securitySettings);
  };
  
  return (
    <>
      <AdminNav />
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure website and admin settings.
          </p>
        </div>
        
        <Tabs defaultValue="website" className="space-y-4">
          <TabsList className="bg-background border grid grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Website</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Website Settings */}
          <TabsContent value="website">
            <Card>
              <CardHeader>
                <CardTitle>Website Settings</CardTitle>
                <CardDescription>
                  Configure general website settings and appearance.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleWebsiteSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input 
                          id="siteName" 
                          name="siteName" 
                          value={websiteSettings.siteName}
                          onChange={handleWebsiteSettingChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input 
                          id="contactEmail" 
                          name="contactEmail" 
                          type="email"
                          value={websiteSettings.contactEmail}
                          onChange={handleWebsiteSettingChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Input 
                        id="siteDescription" 
                        name="siteDescription" 
                        value={websiteSettings.siteDescription}
                        onChange={handleWebsiteSettingChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select 
                        value={websiteSettings.theme} 
                        onValueChange={(value) => handleSelectChange("website", "theme", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Features</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowRegistration">Allow Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to register accounts on the website.
                        </p>
                      </div>
                      <Switch 
                        id="allowRegistration"
                        checked={websiteSettings.allowRegistration}
                        onCheckedChange={(checked) => handleSwitchChange("website", "allowRegistration", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Put the website in maintenance mode (only admins can access).
                        </p>
                      </div>
                      <Switch 
                        id="maintenanceMode"
                        checked={websiteSettings.maintenanceMode}
                        onCheckedChange={(checked) => handleSwitchChange("website", "maintenanceMode", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saveWebsiteSettings.isPending}>
                    {saveWebsiteSettings.isPending ? "Saving..." : "Save Website Settings"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* API Settings */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>
                  Configure API access and rate limiting.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleAPISubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiRateLimit">API Rate Limit (requests per minute)</Label>
                      <Input 
                        id="apiRateLimit" 
                        name="apiRateLimit" 
                        type="number"
                        value={apiSettings.apiRateLimit}
                        onChange={handleAPISettingChange}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">API Access</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enablePublicAPI">Enable Public API</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow public access to the API endpoints.
                        </p>
                      </div>
                      <Switch 
                        id="enablePublicAPI"
                        checked={apiSettings.enablePublicAPI}
                        onCheckedChange={(checked) => handleSwitchChange("api", "enablePublicAPI", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="requireAPIKey">Require API Key</Label>
                        <p className="text-sm text-muted-foreground">
                          Require API keys for all API requests.
                        </p>
                      </div>
                      <Switch 
                        id="requireAPIKey"
                        checked={apiSettings.requireAPIKey}
                        onCheckedChange={(checked) => handleSwitchChange("api", "requireAPIKey", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saveAPISettings.isPending}>
                    {saveAPISettings.isPending ? "Saving..." : "Save API Settings"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and authentication settings.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSecuritySubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminLoginAttempts">Max Login Attempts</Label>
                        <Input 
                          id="adminLoginAttempts" 
                          name="adminLoginAttempts" 
                          type="number"
                          value={securitySettings.adminLoginAttempts}
                          onChange={handleSecuritySettingChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Input 
                          id="sessionTimeout" 
                          name="sessionTimeout" 
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={handleSecuritySettingChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Require two-factor authentication for admin accounts.
                        </p>
                      </div>
                      <Switch 
                        id="enableTwoFactor"
                        checked={securitySettings.enableTwoFactor}
                        onCheckedChange={(checked) => handleSwitchChange("security", "enableTwoFactor", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saveSecuritySettings.isPending}>
                    {saveSecuritySettings.isPending ? "Saving..." : "Save Security Settings"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}