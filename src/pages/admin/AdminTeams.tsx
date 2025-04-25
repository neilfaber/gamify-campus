
import AdminLayout from "@/layouts/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, Users } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

interface TeamLeader {
  username: string | null;
  full_name: string | null;
}

interface Team {
  id: string;
  name: string;
  category: string;
  description: string | null;
  leader_id: string;
  created_at: string;
  logo_url: string | null;
  leader: TeamLeader | null;
  members_count: number;
}

const AdminTeams = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch teams
  const { data: teamsData = [], isLoading } = useQuery({
    queryKey: ["admin-teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          members:team_members(count),
          leader_profile:leader_id(username, full_name)
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
    },
  });
  
  // Filter teams by search
  const filteredTeams = teamsData.filter((team) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(searchLower) ||
      team.category.toLowerCase().includes(searchLower) ||
      (team.description && team.description.toLowerCase().includes(searchLower)) ||
      (team.leader?.full_name && team.leader.full_name.toLowerCase().includes(searchLower)) ||
      (team.leader?.username && team.leader.username.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Teams Management</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-campus-neutral-500 h-4 w-4" />
            <input 
              type="text"
              placeholder="Search teams..."
              className="pl-9 py-2 pr-4 border rounded-md w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-lg border border-campus-neutral-200 overflow-hidden shadow hover:shadow-md transition-shadow"
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
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                        <span className="text-sm text-campus-neutral-500">
                          {team.members_count} member{team.members_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <CustomButton
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/teams/${team.id}`}
                      >
                        View Details
                      </CustomButton>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-campus-neutral-500 text-lg">No teams found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTeams;
