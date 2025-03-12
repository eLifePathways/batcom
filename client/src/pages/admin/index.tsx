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
  return <AdminDashboard />;
}