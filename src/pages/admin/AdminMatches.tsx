
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/layouts/AdminLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Search, Calendar, MapPin, Clock, Users, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  sport: string;
  location: string | null;
  date: string | null;
  time: string | null;
  type: string;
  status: string;
  created_at: string | null;
  participants: {
    count: number;
  };
  creator: {
    username: string | null;
    full_name: string | null;
  } | null;
}

const AdminMatches = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Fetch matches
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["admin-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          participants:match_participants(count),
          creator:created_by(
            profiles(username, full_name)
          )
        `)
        .order("date", { ascending: false });
      
      if (error)  throw error;
      
      return (data as Match[]).map(match => ({
        ...match,
        participants: {
          count: match.participants.length
        },
        creator: match.creator ? {
          username: match.creator.profiles[0]?.username || null,
          full_name: match.creator.profiles[0]?.full_name || null,
        } : null
      }));
    },
  });
  
  // Filter and sort matches
  const filteredMatches = matches.filter((match) => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      match.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.location && match.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || match.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "completed", label: "Completed" },
    { value: "canceled", label: "Canceled" },
  ];
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Matches Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-campus-neutral-500 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search matches..."
                className="pl-9 py-2 pr-4 border rounded-md w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <CustomButton
              variant="outline"
              size="sm"
              iconLeft={<Filter className="h-4 w-4" />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filter
            </CustomButton>
          </div>
        </div>
        
        {/* Status filters */}
        <div className={cn(
          "overflow-x-auto mb-8 transition-all",
          isFilterOpen ? "max-h-32" : "max-h-0"
        )}>
          <div className="flex space-x-2 pb-3">
            {statuses.map((status) => (
              <button
                key={status.value}
                className={cn(
                  "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors",
                  statusFilter === status.value
                    ? "bg-campus-blue text-white"
                    : "bg-campus-neutral-100 text-campus-neutral-700 hover:bg-campus-neutral-200"
                )}
                onClick={() => setStatusFilter(status.value)}
              >
                {status.label}
              </button>
            ))}
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
          <div className="space-y-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <div 
                  key={match.id}
                  className="bg-white rounded-lg border border-campus-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="text-lg font-semibold mr-3">{match.sport} Match</h3>
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            {
                              "bg-yellow-100 text-yellow-800": match.status === "pending",
                              "bg-green-100 text-green-800": match.status === "accepted",
                              "bg-blue-100 text-blue-800": match.status === "completed",
                              "bg-red-100 text-red-800": match.status === "canceled",
                            }
                          )}>
                            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm text-campus-neutral-600">{match.type === "1v1" ? "1v1 Match" : "Team Match"}</span>
                      </div>
                      
                      <div className="mt-4 sm:mt-0">
                        <CustomButton
                          variant="outline"
                          size="sm"
                          onClick={() => alert(`View match details for ${match.id}`)}
                        >
                          View Details
                        </CustomButton>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                      {match.date && (
                        <div className="flex items-center text-campus-neutral-500 text-sm">
                          <Calendar className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                          <span>{new Date(match.date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {match.time && (
                        <div className="flex items-center text-campus-neutral-500 text-sm">
                          <Clock className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                          <span>{match.time}</span>
                        </div>
                      )}
                      
                      {match.location && (
                        <div className="flex items-center text-campus-neutral-500 text-sm">
                          <MapPin className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                          <span>{match.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-campus-neutral-500 text-sm">
                        <Users className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                        <span>{match.participants.count} participant{match.participants.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-campus-neutral-500">
                      Created by: {match.creator?.full_name || match.creator?.username || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-campus-neutral-500">No matches found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMatches;
