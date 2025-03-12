import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminNav from "@/components/admin/admin-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleOff, Users, MousePointerClick, Clock, ArrowUp } from "lucide-react";

// Mock data for initial development - will be replaced with real data from API
const mockVisitorData = [
  { date: "2025-03-01", visitors: 120, pageViews: 320, sessions: 85 },
  { date: "2025-03-02", visitors: 132, pageViews: 350, sessions: 94 },
  { date: "2025-03-03", visitors: 101, pageViews: 275, sessions: 71 },
  { date: "2025-03-04", visitors: 134, pageViews: 390, sessions: 88 },
  { date: "2025-03-05", visitors: 190, pageViews: 450, sessions: 120 },
  { date: "2025-03-06", visitors: 230, pageViews: 510, sessions: 155 },
  { date: "2025-03-07", visitors: 220, pageViews: 505, sessions: 145 },
];

const mockDeviceData = [
  { name: "Desktop", value: 58 },
  { name: "Mobile", value: 37 },
  { name: "Tablet", value: 5 },
];

const mockSourceData = [
  { name: "Direct", value: 40 },
  { name: "Organic Search", value: 30 },
  { name: "Referral", value: 20 },
  { name: "Social", value: 10 },
];

const mockPopularPagesData = [
  { 
    page: "/", 
    title: "Home", 
    views: 450, 
    avgTimeOnPage: 65, 
    bounceRate: 35 
  },
  { 
    page: "/what-we-do", 
    title: "What We Do", 
    views: 320, 
    avgTimeOnPage: 95, 
    bounceRate: 25 
  },
  { 
    page: "/publications", 
    title: "Publications", 
    views: 285, 
    avgTimeOnPage: 120, 
    bounceRate: 20 
  },
  { 
    page: "/team", 
    title: "Team", 
    views: 210, 
    avgTimeOnPage: 75, 
    bounceRate: 30 
  },
  { 
    page: "/background-papers", 
    title: "Background Papers", 
    views: 185, 
    avgTimeOnPage: 110, 
    bounceRate: 22 
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7days");
  
  // Fetch real data from API endpoints
  const { data: visitorData, isLoading: isVisitorDataLoading } = useQuery({
    queryKey: ['/api/analytics/visitors', timeRange],
    queryFn: () => apiRequest(`/api/analytics/visitors?timeRange=${timeRange}`),
  });
  
  const { data: deviceData, isLoading: isDeviceDataLoading } = useQuery({
    queryKey: ['/api/analytics/devices', timeRange],
    queryFn: () => apiRequest(`/api/analytics/devices?timeRange=${timeRange}`),
  });
  
  const { data: sourceData, isLoading: isSourceDataLoading } = useQuery({
    queryKey: ['/api/analytics/sources', timeRange],
    queryFn: () => apiRequest(`/api/analytics/sources?timeRange=${timeRange}`),
  });
  
  const { data: popularPagesData, isLoading: isPopularPagesLoading } = useQuery({
    queryKey: ['/api/analytics/popular-pages', timeRange],
    queryFn: () => apiRequest(`/api/analytics/popular-pages?timeRange=${timeRange}`),
  });

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (!visitorData || visitorData.length === 0) return { 
      totalVisitors: 0, 
      totalPageViews: 0, 
      totalSessions: 0, 
      avgPagesPerSession: 0 
    };

    const totalVisitors = visitorData.reduce((sum, day) => sum + day.visitors, 0);
    const totalPageViews = visitorData.reduce((sum, day) => sum + day.pageViews, 0);
    const totalSessions = visitorData.reduce((sum, day) => sum + day.sessions, 0);
    const avgPagesPerSession = totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(2) : 0;

    return { totalVisitors, totalPageViews, totalSessions, avgPagesPerSession };
  };

  const summaryMetrics = calculateSummaryMetrics();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Visitor Analytics</h2>
            <p className="text-muted-foreground">Understand your website traffic and visitor behavior</p>
          </div>
          <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                {isVisitorDataLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{summaryMetrics.totalVisitors}</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MousePointerClick className="mr-2 h-4 w-4 text-muted-foreground" />
                {isVisitorDataLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{summaryMetrics.totalPageViews}</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                {isVisitorDataLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{summaryMetrics.totalSessions}</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pages / Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowUp className="mr-2 h-4 w-4 text-muted-foreground" />
                {isVisitorDataLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{summaryMetrics.avgPagesPerSession}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Over Time Chart */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Traffic Over Time</CardTitle>
                  <CardDescription>Visitors, page views, and sessions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isVisitorDataLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={visitorData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="visitors" stroke="#0088FE" strokeWidth={2} />
                        <Line type="monotone" dataKey="pageViews" stroke="#00C49F" strokeWidth={2} />
                        <Line type="monotone" dataKey="sessions" stroke="#FFBB28" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              {/* Device Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Distribution</CardTitle>
                  <CardDescription>Visitors by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  {isDeviceDataLoading ? (
                    <Skeleton className="h-[250px] w-full" />
                  ) : deviceData && (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                  {isSourceDataLoading ? (
                    <Skeleton className="h-[250px] w-full" />
                  ) : sourceData && (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="visitors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Visitor Trends</CardTitle>
                  <CardDescription>Daily visitors over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isVisitorDataLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={visitorData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="visitors" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              {/* More visitor-specific charts would go here */}
            </div>
          </TabsContent>
          
          <TabsContent value="pages">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Pages</CardTitle>
                  <CardDescription>Most viewed pages on your site</CardDescription>
                </CardHeader>
                <CardContent>
                  {isPopularPagesLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : popularPagesData && (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-10 p-4 bg-muted text-sm font-medium">
                        <div className="col-span-4">Page</div>
                        <div className="col-span-2 text-right">Views</div>
                        <div className="col-span-2 text-right">Avg. Time (sec)</div>
                        <div className="col-span-2 text-right">Bounce Rate</div>
                      </div>
                      {popularPagesData.map((page, i) => (
                        <div key={i} className="grid grid-cols-10 p-4 text-sm border-t">
                          <div className="col-span-4 font-medium truncate" title={page.page}>
                            {page.title}
                            <span className="block text-xs text-muted-foreground">{page.page}</span>
                          </div>
                          <div className="col-span-2 text-right">{page.views}</div>
                          <div className="col-span-2 text-right">{page.avgTimeOnPage}s</div>
                          <div className="col-span-2 text-right">{page.bounceRate}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}