
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Search, Filter, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Team categories
const categories = [
  "All Teams",
  "Basketball",
  "Football",
  "Volleyball",
  "Tennis",
  "Badminton",
  "Table Tennis",
  "Cricket",
  "Swimming"
];

interface Team {
  id: string;
  name: string;
  description: string | null;
  category: string;
  leader_id: string;
  logo_url: string | null;
  created_at: string;
  members: {
    count: number;
  };
  leader: {
    username: string | null;
    full_name: string | null;
  };
}

const Teams = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Teams");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user } = useAuth();
  
  // Fetch teams with member counts
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          members:team_members(count),
          leader:leader_id(username, full_name)
        `)
        .order("name");
      
      if (error) {
        console.error("Error loading teams:", error);
        throw error;
      }
      
      return (data as Team[]).map(team => ({
        ...team,
        members: {
          count: team.members.length
        }
      }));
    }
  });
  
  const filteredTeams = teams.filter((team) => {
    // Filter by search query
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = selectedCategory === "All Teams" || team.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue mx-auto"></div>
          <p className="mt-4 text-campus-neutral-600">Loading teams...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-20 pb-16 bg-gradient-to-b from-campus-blue-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-campus-neutral-900 mb-4">Teams</h1>
          <p className="text-lg text-campus-neutral-600 max-w-2xl">
            Find and join teams, or create your own team to participate in campus sports events.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-campus-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search teams..."
              className="block w-full pl-10 pr-3 py-2 border border-campus-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              iconLeft={<Filter className="h-4 w-4" />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filter
            </CustomButton>
            
            <Link to="/teams/create">
              <CustomButton
                variant="primary"
                size="sm"
                iconLeft={<Plus className="h-4 w-4" />}
              >
                Create Team
              </CustomButton>
            </Link>
          </div>
        </div>
        
        {/* Category filters */}
        <div className={cn(
          "overflow-x-auto mb-8 transition-all",
          isFilterOpen ? "max-h-32" : "max-h-0 md:max-h-32"
        )}>
          <div className="flex space-x-2 pb-3">
            {categories.map((category) => (
              <button
                key={category}
                className={cn(
                  "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors",
                  selectedCategory === category
                    ? "bg-campus-blue text-white"
                    : "bg-campus-neutral-100 text-campus-neutral-700 hover:bg-campus-neutral-200"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Teams grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <Link
                to={`/teams/${team.id}`}
                key={team.id} 
                className="rounded-xl overflow-hidden border border-campus-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gradient-to-r from-campus-blue to-campus-blue-dark flex items-center justify-center relative">
                  {team.logo_url ? (
                    <img 
                      src={team.logo_url} 
                      alt={team.name} 
                      className="w-24 h-24 object-cover rounded-full border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                      <span className="text-3xl font-bold text-campus-blue">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-medium">
                    {team.category}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-campus-neutral-900 mb-1">{team.name}</h3>
                  <p className="text-campus-neutral-500 text-sm mb-3">
                    Led by {team.leader?.full_name || team.leader?.username || 'Unknown'}
                  </p>
                  
                  {team.description && (
                    <p className="text-campus-neutral-600 text-sm mb-4 line-clamp-2">
                      {team.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-campus-neutral-500 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                      <span>{team.members.count} member{team.members.count !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <span className="text-campus-blue-dark hover:underline">View Details</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-campus-neutral-500 text-lg mb-6">No teams found matching your criteria.</p>
              <Link to="/teams/create">
                <CustomButton variant="primary" iconLeft={<Plus className="h-4 w-4" />}>
                  Create a Team
                </CustomButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Teams;
