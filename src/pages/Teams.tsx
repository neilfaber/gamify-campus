
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/layouts/MainLayout";
import { Search, Filter, Users, Tag, Calendar } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";
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

interface TeamLeader {
  username: string | null;
  full_name: string | null;
  avatar_url?: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  category: string;
  logo_url: string | null;
  leader_id: string;
  created_at: string;
  members_count: number;
  leader: TeamLeader | null;
}

const Teams = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Teams");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch teams
  const { data: teamsData = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          members:team_members(count),
          leader_profile:leader_id(username, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the Team interface
      const transformedData: Team[] = (data || []).map((team: any) => ({
        ...team,
        members_count: team.members?.[0]?.count || 0,
        leader: team.leader_profile?.[0] || null
      }));
      
      return transformedData;
    }
  });
  
  // Filter teams by search and category
  const filteredTeams = teamsData.filter((team) => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.leader?.full_name && team.leader.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.leader?.username && team.leader.username.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = selectedCategory === "All Teams" || team.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <MainLayout>
      <div className="pt-20 pb-16 bg-gradient-to-b from-campus-blue-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-campus-neutral-900 mb-4">Teams</h1>
          <p className="text-lg text-campus-neutral-600 max-w-2xl">
            Join existing teams or create your own to participate in events and competitions on campus.
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
            
            <CustomButton
              variant="primary"
              onClick={() => navigate("/teams/create")}
            >
              Create Team
            </CustomButton>
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
        {isLoadingTeams ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <div 
                  key={team.id} 
                  className="bg-white rounded-lg border border-campus-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-32 bg-gradient-to-r from-campus-blue to-campus-blue-dark flex items-center justify-center relative">
                    {team.logo_url ? (
                      <img 
                        src={team.logo_url} 
                        alt={team.name} 
                        className="w-20 h-20 object-cover rounded-full border-4 border-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center">
                        <span className="text-2xl font-bold text-campus-blue">
                          {team.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/80 text-xs font-medium">
                      {team.category}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-1">{team.name}</h3>
                    <p className="text-campus-neutral-500 text-sm mb-3">
                      Led by {team.leader?.full_name || team.leader?.username || 'Unknown'}
                    </p>
                    
                    {team.description && (
                      <p className="text-campus-neutral-600 text-sm mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-campus-neutral-500 text-sm">
                        <Users className="h-4 w-4 mr-1.5" />
                        <span>{team.members_count} member{team.members_count !== 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center text-campus-neutral-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>{new Date(team.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link to={`/teams/${team.id}`} className="w-full">
                        <CustomButton variant="primary" className="w-full">
                          View Team
                        </CustomButton>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-campus-neutral-500 text-lg">No teams found matching your criteria.</p>
                {selectedCategory !== "All Teams" && (
                  <p className="mt-2 text-campus-neutral-500">Try selecting a different category or creating your own team.</p>
                )}
                {!user && (
                  <p className="mt-4">
                    <Link to="/auth" className="text-campus-blue hover:underline">Sign in</Link> to create your own team.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Teams;
