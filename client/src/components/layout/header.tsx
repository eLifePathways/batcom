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
      {/* Top institutional bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center">
          <img 
            src="https://www.jhsph.edu/themes/custom/jhu_symposium/logo.svg" 
            alt="Johns Hopkins Bloomberg School of Public Health" 
            className="h-10"
          />
          <div className="ml-3 hidden md:block">
            <div className="text-primary font-montserrat font-semibold text-sm">BLOOMBERG SCHOOL</div>
            <div className="text-primary text-xs">of PUBLIC HEALTH</div>
          </div>
        </Link>
        
        <div className="flex items-center">
          <img 
            src="https://cdn.pixabay.com/photo/2020/01/28/10/34/bat-4798152_1280.png" 
            alt="Bat-Com Logo" 
            className="h-10"
          />
          <span className="ml-2 font-montserrat font-semibold text-primary">Bat-Com</span>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="hidden md:block font-montserrat font-bold text-lg text-primary">
            Bat Virus Research Consortium
          </div>
          
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
                        ? "text-blue-600 font-semibold"
                        : "text-primary hover:text-blue-500"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <nav className="hidden md:flex md:items-center">
            {navItems.map((item, index) => (
              <Link 
                key={item.path + item.name}
                href={item.path}
                className={`font-medium px-3 py-2 text-sm rounded-md transition duration-200 ${
                  location === item.path
                    ? "text-blue-600 bg-blue-50 font-semibold"
                    : "text-primary hover:text-blue-500 hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="bg-primary h-2 w-full"></div>
    </header>
  );
};

export default Header;
