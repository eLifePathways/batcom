import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Team from "@/pages/team";
import Publications from "@/pages/publications";
import BackgroundPapers from "@/pages/background-papers";
import Search from "@/pages/search";
import WhatWeDo from "@/pages/what-we-do";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";
import AdminPage from "@/pages/admin/index";
import AdminTeam from "@/pages/admin/team";
import AdminPublications from "@/pages/admin/publications";
import AdminBackgroundPapers from "@/pages/admin/background-papers";
import AdminVirusCategories from "@/pages/admin/virus-categories";
import AdminSettings from "@/pages/admin/settings";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  
  // If we're on an admin route, we use a different layout
  if (isAdminRoute) {
    return (
      <Switch>
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/team" component={AdminTeam} />
        <Route path="/admin/publications" component={AdminPublications} />
        <Route path="/admin/background-papers" component={AdminBackgroundPapers} />
        <Route path="/admin/virus-categories" component={AdminVirusCategories} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  // Main site layout
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow bg-white">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/team" component={Team} />
          <Route path="/publications" component={Publications} />
          <Route path="/background-papers" component={BackgroundPapers} />
          <Route path="/what-we-do" component={WhatWeDo} />
          <Route path="/search" component={Search} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
