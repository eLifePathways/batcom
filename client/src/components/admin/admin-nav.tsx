import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  BookOpen, 
  FileText, 
  Bug, 
  Settings, 
  BarChart, 
  UserCog, 
  AlertCircle,
  Layout,
  Globe
} from "lucide-react";

export default function AdminNav() {
  const [location] = useLocation();

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      active: location === "/admin" || location === "/admin/",
    },
    {
      href: "/admin/team",
      label: "Team Members",
      icon: <Users className="h-5 w-5" />,
      active: location === "/admin/team" || location.startsWith("/admin/team/"),
    },
    {
      href: "/admin/virus-categories",
      label: "Virus Categories",
      icon: <Bug className="h-5 w-5" />,
      active: location === "/admin/virus-categories" || location.startsWith("/admin/virus-categories/"),
    },
    {
      href: "/admin/publications",
      label: "Publications",
      icon: <BookOpen className="h-5 w-5" />,
      active: location === "/admin/publications" || location.startsWith("/admin/publications/"),
    },
    {
      href: "/admin/background-papers",
      label: "Background Papers",
      icon: <FileText className="h-5 w-5" />,
      active: location === "/admin/background-papers" || location.startsWith("/admin/background-papers/"),
    },
    {
      href: "/admin/what-we-do",
      label: "What We Do",
      icon: <Layout className="h-5 w-5" />,
      active: location === "/admin/what-we-do" || location.startsWith("/admin/what-we-do/"),
    },
    {
      href: "/admin/graphql",
      label: "GraphQL API",
      icon: <Globe className="h-5 w-5" />,
      active: location === "/admin/graphql" || location.startsWith("/admin/graphql/"),
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: <UserCog className="h-5 w-5" />,
      active: location === "/admin/users" || location.startsWith("/admin/users/"),
    },
    {
      href: "/admin/issues",
      label: "Issue Reports",
      icon: <AlertCircle className="h-5 w-5" />,
      active: location === "/admin/issues" || location.startsWith("/admin/issues/"),
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      active: location === "/admin/analytics" || location.startsWith("/admin/analytics/"),
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      active: location === "/admin/settings" || location.startsWith("/admin/settings/"),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 mb-6">
      <div className="container mx-auto px-4">
        <nav className="flex items-center space-x-4 overflow-x-auto py-4">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:text-primary hover:bg-primary/5 dark:text-gray-300 dark:hover:text-primary"
              )}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}