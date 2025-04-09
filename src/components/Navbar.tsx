import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, UserCircle } from "lucide-react";
import { CustomButton } from "./ui/custom-button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Games", href: "/games" },
    { name: "Matchmaking", href: "/matchmaking" },
    { name: "Teams", href: "/teams" },
    { name: "Certificates", href: "/certificates" },
    { name: "Analytics", href: "/analytics" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="/logo.png"
                alt="CampusPlay Logo"
                className="h-20 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "text-campus-blue"
                      : "text-campus-neutral-600 hover:text-campus-neutral-900"
                  )}
                >
                  {item.name}
                  {location.pathname === item.href && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-campus-blue rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link to="/profile">
                <CustomButton
                  variant="ghost"
                  size="sm"
                  iconLeft={<UserCircle className="h-5 w-5" />}
                >
                  Profile
                </CustomButton>
              </Link>
            ) : (
              <CustomButton
                variant="primary"
                size="sm"
                iconLeft={<LogIn className="h-4 w-4" />}
                onClick={() => setIsLoggedIn(true)}
              >
                Sign In
              </CustomButton>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-campus-neutral-50 p-2 rounded-md text-campus-neutral-600 hover:text-campus-neutral-900 hover:bg-campus-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-campus-blue"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-white z-40 transition-transform transform ease-in-out duration-300",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="pt-24 pb-3 px-6 space-y-1 h-full flex flex-col">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "block px-3 py-4 rounded-md text-lg font-medium border-b border-campus-neutral-100",
                location.pathname === item.href
                  ? "text-campus-blue border-campus-blue"
                  : "text-campus-neutral-700 hover:text-campus-blue"
              )}
            >
              {item.name}
            </Link>
          ))}
          
          <div className="mt-auto">
            {isLoggedIn ? (
              <Link to="/profile" className="block w-full">
                <CustomButton
                  variant="ghost"
                  size="lg"
                  className="w-full justify-start"
                  iconLeft={<UserCircle className="h-5 w-5" />}
                >
                  Profile
                </CustomButton>
              </Link>
            ) : (
              <CustomButton
                variant="primary"
                size="lg"
                className="w-full"
                iconLeft={<LogIn className="h-5 w-5" />}
                onClick={() => setIsLoggedIn(true)}
              >
                Sign In
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
