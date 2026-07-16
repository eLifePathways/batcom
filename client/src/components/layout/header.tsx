import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navItems = [
  { name: 'Home', path: '/' },
  //   { name: 'Who we are', path: '/team' },
  //   { name: 'What we do', path: '/what-we-do' },
  { name: 'About us', path: '/about-us' },
  { name: 'Our reviews', path: '/publications' },
  { name: 'Background papers', path: '/background-papers' },
  { name: 'Search our reviews', path: '/search' },
  { name: 'Contact', path: '/contact' },
]

const Header = () => {
  const [location] = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const closeSheet = () => setIsOpen(false)

  return (
    <header className="bg-background shadow-md">
      {/* Top institutional bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between border-b border-border">
        <Link href="/" className="flex items-center">
          {/* <img
            src="/assets/logos-vertical-1024x683.jpg"
            alt="Johns Hopkins University"
            className="h-12"
          /> */}
          <img
            src="/assets/logos/bloomberg-logo.svg"
            alt="Johns Hopkins Bloomberg School of Public Health"
            className="h-24"
          />
        </Link>

        {/* <div className="flex items-center">
          <img src="/assets/bats.png" alt="Bat-Com Logo" className="h-12" />
        </div> */}
        <div className="hidden md:block font-heading font-bold text-lg">
          Bat Virus Spillover Evidence Consortium
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4">
        {/* <div className="flex items-center justify-between"> */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6 text-primary" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col space-y-4 mt-8">
              {navItems.map(item => (
                <Link
                  key={item.path + item.name}
                  href={item.path}
                  onClick={closeSheet}
                  className={`text-lg font-medium transition py-2 ${
                    location === item.path
                      ? 'text-primary font-semibold'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <nav className="hidden md:flex md:items-center md:justify-between">
          {navItems.map(item => (
            <Link
              key={item.path + item.name}
              href={item.path}
              className={`font-medium px-3 py-2 text-sm transition duration-200 border-b-2 mx-1 ${
                location === item.path
                  ? 'text-primary border-primary'
                  : 'text-foreground hover:text-primary border-transparent hover:border-primary/40'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        {/* </div> */}
      </div>

      <div className="bg-primary h-2 w-full"></div>
    </header>
  )
}

export default Header
