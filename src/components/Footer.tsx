
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Games", href: "/games" },
        { name: "Matchmaking", href: "/matchmaking" },
        { name: "Teams", href: "/teams" },
        { name: "Certificates", href: "/certificates" },
        { name: "Analytics", href: "/analytics" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Privacy", href: "#" },
        { name: "Terms", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Contact", href: "#" },
        { name: "FAQ", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-campus-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold bg-gradient-to-r from-campus-blue to-campus-blue-dark bg-clip-text text-transparent">CampusPlay</span>
            </Link>
            <p className="mt-4 text-sm text-campus-neutral-600 max-w-xs">
              Revolutionizing campus sports with intelligent matchmaking, scheduling, and digital recognition.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-campus-neutral-400 hover:text-campus-blue transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-campus-neutral-400 hover:text-campus-blue transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-campus-neutral-400 hover:text-campus-blue transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-campus-neutral-400 hover:text-campus-blue transition-colors">
                <span className="sr-only">Email</span>
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links columns */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-campus-neutral-900 tracking-wider uppercase">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-campus-neutral-500 hover:text-campus-blue transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-campus-neutral-200">
          <p className="text-sm text-campus-neutral-500 text-center">
            &copy; {currentYear} CampusPlay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
