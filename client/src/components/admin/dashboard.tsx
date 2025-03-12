import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, BookOpen, FileText, Bug } from "lucide-react";

export default function AdminDashboard() {
  // Fetch data for dashboard statistics
  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ['/api/team-members'],
  });
  
  const { data: publications = [] } = useQuery<any[]>({
    queryKey: ['/api/publications'],
  });
  
  const { data: backgroundPapers = [] } = useQuery<any[]>({
    queryKey: ['/api/background-papers'],
  });
  
  const { data: virusCategories = [] } = useQuery<any[]>({
    queryKey: ['/api/virus-categories'],
  });
  
  // Prepare data for publications by year chart
  const publicationsByYear = publications && Array.isArray(publications) ? 
    Object.entries(
      publications.reduce((acc: Record<number, number>, pub: any) => {
        acc[pub.year] = (acc[pub.year] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    )
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year)) : [];
  
  // Stats cards data
  const statsCards = [
    {
      title: "Team Members",
      value: teamMembers?.length || 0,
      description: "Researchers and staff members",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/team",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      title: "Virus Categories",
      value: virusCategories?.length || 0,
      description: "Categorized virus families",
      icon: <Bug className="h-6 w-6" />,
      href: "/admin/virus-categories",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      title: "Publications",
      value: publications?.length || 0,
      description: "Research publications",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/admin/publications",
      color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    {
      title: "Background Papers",
      value: backgroundPapers?.length || 0,
      description: "Educational resources",
      icon: <FileText className="h-6 w-6" />,
      href: "/admin/background-papers",
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
  ];
  
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage and monitor your content in one place.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <a>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <div className={`p-2 rounded-full ${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{card.value}</p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
      
      {/* Publications Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Publications by Year</CardTitle>
          <CardDescription>Number of publications by year of publication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publicationsByYear} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/team?action=new">
              <a className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Add Team Member</p>
                  <p className="text-sm text-gray-500">Create a new researcher profile</p>
                </div>
              </a>
            </Link>
            
            <Link href="/admin/publications?action=new">
              <a className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="p-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 mr-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Add Publication</p>
                  <p className="text-sm text-gray-500">Create a new research publication</p>
                </div>
              </a>
            </Link>
            
            <Link href="/admin/background-papers?action=new">
              <a className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="p-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 mr-3">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Add Background Paper</p>
                  <p className="text-sm text-gray-500">Create a new educational resource</p>
                </div>
              </a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}