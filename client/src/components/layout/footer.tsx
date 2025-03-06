import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 flex items-center">
            <img 
              src="https://www.jhsph.edu/themes/custom/jhu_symposium/logo-white.svg" 
              alt="Johns Hopkins Bloomberg School of Public Health" 
              className="h-12"
            />
            <div className="ml-4">
              <div className="font-montserrat font-semibold">BLOOMBERG SCHOOL</div>
              <div className="text-sm">of PUBLIC HEALTH</div>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm">© 2024 The Johns Hopkins University</p>
            <div className="mt-2">
              <Link 
                href="/contact" 
                className="text-gray-300 hover:text-white transition mr-4"
              >
                Contact us
              </Link>
              <a 
                href="https://policies.jhu.edu/privacy-statement/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition mr-4"
              >
                Privacy Policy
              </a>
              <a 
                href="https://policies.jhu.edu/terms-use/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
              >
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
