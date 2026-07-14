import { Link } from 'wouter'

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 flex flex-col md:flex-row items-center">
            <div className="mb-4 md:mb-0">
              <img
                src="/assets/logos/bloomberg-white-logo.svg"
                alt="Johns Hopkins University"
                className="h-14 w-auto"
              />
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm">
              © {new Date().getFullYear()} The Johns Hopkins University
            </p>
            <div className="mt-2">
              <Link
                href="/contact"
                className="text-primary-foreground/70 hover:text-primary-foreground transition mr-4"
              >
                Contact us
              </Link>
              <a
                href="https://policies.jhu.edu/privacy-statement/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground transition mr-4"
              >
                Privacy Policy
              </a>
              <a
                href="https://policies.jhu.edu/terms-use/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground transition"
              >
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
