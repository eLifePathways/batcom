import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  Bug, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminDashboard from "@/components/admin/dashboard";

// Sidebar navigation items
const navItems = [
  { 
    title: "Dashboard", 
    href: "/admin", 
    icon: <LayoutDashboard className="h-5 w-5" /> 
  },
  { 
    title: "Team Members", 
    href: "/admin/team", 
    icon: <Users className="h-5 w-5" /> 
  },
  { 
    title: "Virus Categories", 
    href: "/admin/virus-categories", 
    icon: <Bug className="h-5 w-5" /> 
  },
  { 
    title: "Publications", 
    href: "/admin/publications", 
    icon: <BookOpen className="h-5 w-5" /> 
  },
  { 
    title: "Background Papers", 
    href: "/admin/background-papers", 
    icon: <FileText className="h-5 w-5" /> 
  },
  { 
    title: "Settings", 
    href: "/admin/settings", 
    icon: <Settings className="h-5 w-5" /> 
  }
];

export default function AdminPage() {
  const [location] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        >
          {mobileSidebarOpen ? 
            <X className="h-6 w-6" /> : 
            <Menu className="h-6 w-6" />
          }
        </button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-primary">Bat-Com Admin</h1>
            <p className="text-sm text-gray-500">Content Management System</p>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </a>
              </Link>
            ))}
          </nav>
          
          {/* User info */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">A</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">admin@batcom.org</p>
              </div>
            </div>
            <Link href="/">
              <a className="mt-4 block text-sm text-primary hover:underline">
                Return to Site
              </a>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <main className="container mx-auto p-8">
          <AdminDashboard />
        </main>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}