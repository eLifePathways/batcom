import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Who we are", path: "/team" },
  { name: "What we do", path: "/" },
  { name: "Most recent reviews", path: "/publications" },
  { name: "Background papers", path: "/background-papers" },
  { name: "Search our reviews", path: "/search" },
];

const Header = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between mb-4 md:mb-0">
          <Link href="/" className="flex items-center">
            <img 
              src="https://www.jhsph.edu/themes/custom/jhu_symposium/logo.svg" 
              alt="Johns Hopkins Bloomberg School of Public Health" 
              className="h-12"
            />
            <div className="ml-4 hidden md:block">
              <div className="text-primary font-montserrat font-semibold">BLOOMBERG SCHOOL</div>
              <div className="text-primary text-sm">of PUBLIC HEALTH</div>
            </div>
          </Link>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 text-primary" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link 
                    key={item.path + item.name}
                    href={item.path}
                    onClick={closeSheet}
                    className={`text-lg font-medium transition py-2 ${
                      location === item.path
                        ? "text-blue-600"
                        : "text-primary hover:text-blue-500"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        <nav className="hidden md:flex md:items-center space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.path + item.name}
              href={item.path}
              className={`font-medium transition duration-200 ${
                location === item.path
                  ? "text-blue-600"
                  : "text-primary hover:text-blue-500"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="md:flex items-center hidden">
          <div className="ml-4 flex items-center">
            <img 
              src="https://cdn.pixabay.com/photo/2020/01/28/10/34/bat-4798152_1280.png" 
              alt="Bat-Com Logo" 
              className="h-12"
            />
            <span className="ml-2 font-montserrat font-semibold text-primary">Bat-Com</span>
          </div>
        </div>
      </div>
      
      <div className="bg-primary h-3 w-full"></div>
    </header>
  );
};

export default Header;
