import React from "react";
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
  ArrowLeft,
  UserCog,
  AlertCircle,
  Layout,
  Globe
} from "lucide-react";

const AdminSidebar = () => {
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
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">Bat-Com Admin</h1>
        <p className="text-sm text-muted-foreground">Content Management System</p>
      </div>
      
      <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
        <div className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:text-primary hover:bg-primary/5"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Link 
          href="/" 
          className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary hover:bg-primary/5"
        >
          <ArrowLeft className="h-5 w-5 mr-3" />
          Return to Site
        </Link>
      </div>
    </div>
  );
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  
  // If we're at exactly /admin without trailing slash, redirect to /admin/
  React.useEffect(() => {
    if (location === "/admin") {
      // Make sure we're on the admin dashboard route
      navigate("/admin/");
    }
  }, [location, navigate]);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}