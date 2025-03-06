import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Who we are", path: "/team" },
  { name: "What we do", path: "/what-we-do" },
  { name: "Most recent reviews", path: "/publications" },
  { name: "Background papers", path: "/background-papers" },
  { name: "Search our reviews", path: "/search" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  return (
    <header className="bg-white shadow-md">
      {/* Top institutional bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <img 
            src="/assets/logos-vertical-1024x683.jpg" 
            alt="Johns Hopkins University" 
            className="h-12"
          />
        </Link>
        
        <div className="flex items-center">
          <img 
            src="/assets/bats.png" 
            alt="Bat-Com Logo" 
            className="h-12"
          />
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4">
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
          
          <nav className="hidden md:flex md:items-center md:space-x-2">
            {navItems.map((item) => (
              <Link 
                key={item.path + item.name}
                href={item.path}
                className={`font-medium px-3 py-2 text-sm transition duration-200 border-b-2 mx-1 ${
                  location === item.path
                    ? "text-blue-700 border-blue-600"
                    : "text-primary hover:text-blue-600 border-transparent hover:border-blue-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="bg-blue-800 h-2 w-full mt-2"></div>
    </header>
  );
};

export default Header;
