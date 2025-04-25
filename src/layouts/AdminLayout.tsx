
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Users, Calendar, Award, BarChart, Settings } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: <BarChart className="h-5 w-5" /> },
    { name: "Events", href: "/admin/events", icon: <Calendar className="h-5 w-5" /> },
    { name: "Teams", href: "/admin/teams", icon: <Users className="h-5 w-5" /> },
    { name: "Users", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
    { name: "Certificates", href: "/admin/certificates", icon: <Award className="h-5 w-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-campus-neutral-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform lg:translate-x-0 lg:static",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b">
          <Link to="/admin" className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-campus-blue to-campus-blue-dark bg-clip-text text-transparent">
              Admin Panel
            </span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-campus-blue text-white"
                  : "text-campus-neutral-700 hover:bg-campus-neutral-100"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
          
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-3 rounded-md text-sm font-medium text-campus-neutral-700 hover:bg-campus-neutral-100 w-full transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:ml-64 min-h-screen">
        {/* Top navbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
          <button
            type="button"
            className="lg:hidden p-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          <div className="flex items-center space-x-4">
            <Link to="/">
              <CustomButton variant="outline" size="sm">
                View Website
              </CustomButton>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
