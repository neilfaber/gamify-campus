
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Search, Users, Trophy, Calendar, UserPlus, Trash, Edit, AlertCircle, ChevronDown } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";

// Sample teams data
const teamsData = [
  {
    id: 1,
    name: "Slam Dunkers",
    sport: "Basketball",
    members: 5,
    wins: 12,
    losses: 3,
    nextMatch: "May 20, 2023",
    isOwned: true,
    description: "Computer Science department basketball team. Looking for skilled players.",
    avatar: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Tornado Spikers",
    sport: "Volleyball",
    members: 8,
    wins: 7,
    losses: 5,
    nextMatch: "May 18, 2023",
    isOwned: false,
    description: "Mixed volleyball team open to all departments. Weekly practice on Wednesdays.",
    avatar: "https://images.unsplash.com/photo-1588492069431-0cdb96703424?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Net Masters",
    sport: "Tennis",
    members: 4,
    wins: 15,
    losses: 2,
    nextMatch: "May 22, 2023",
    isOwned: false,
    description: "Competitive tennis team. Participants should have at least 1 year of experience.",
    avatar: "https://images.unsplash.com/photo-1560012057-4372e14c5085?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Eagle Strikers",
    sport: "Football",
    members: 11,
    wins: 9,
    losses: 6,
    nextMatch: "May 25, 2023",
    isOwned: false,
    description: "Engineering department football team. Weekly practice on Tuesdays and Thursdays.",
    avatar: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Shuttle Stars",
    sport: "Badminton",
    members: 6,
    wins: 8,
    losses: 4,
    nextMatch: "May 19, 2023",
    isOwned: true,
    description: "Badminton team open to all. Beginner-friendly with coaching available.",
    avatar: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop"
  }
];

const Teams = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "myTeams">("browse");
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  
  const filteredTeams = teamsData.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          team.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          team.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "myTeams") {
      return matchesSearch && team.isOwned;
    }
    
    return matchesSearch;
  });

  return (
    <MainLayout>
      <div className="pt-20 pb-16 bg-gradient-to-b from-campus-blue-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-campus-neutral-900 mb-4">Teams</h1>
              <p className="text-lg text-campus-neutral-600 max-w-2xl">
                Join existing teams or create your own to participate in team-based competitions.
              </p>
            </div>
            <CustomButton 
              variant="primary" 
              size="lg"
              iconLeft={<UserPlus className="h-5 w-5" />}
              onClick={() => setIsCreateTeamOpen(!isCreateTeamOpen)}
            >
              Create Team
            </CustomButton>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Create team form */}
        {isCreateTeamOpen && (
          <div className="mb-8 p-6 rounded-xl border border-campus-neutral-200 bg-white shadow-sm animate-scale-up">
            <h2 className="text-xl font-semibold text-campus-neutral-900 mb-4">Create a New Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-campus-neutral-700 mb-1">Team Name</label>
                <input 
                  type="text" 
                  className="block w-full px-3 py-2 border border-campus-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                  placeholder="Enter team name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-campus-neutral-700 mb-1">Sport</label>
                <div className="relative">
                  <select 
                    className="block w-full px-3 py-2 border border-campus-neutral-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                  >
                    <option value="">Select a sport</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Football">Football</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Table Tennis">Table Tennis</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Swimming">Swimming</option>
                  </select>
                  <ChevronDown className="h-4 w-4 text-campus-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-campus-neutral-700 mb-1">Team Description</label>
                <textarea 
                  className="block w-full px-3 py-2 border border-campus-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                  placeholder="Describe your team, requirements, and practice schedule"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <CustomButton 
                variant="outline" 
                onClick={() => setIsCreateTeamOpen(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton variant="primary">
                Create Team
              </CustomButton>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="mb-6 border-b border-campus-neutral-200">
          <div className="flex -mb-px">
            <button
              className={cn(
                "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                activeTab === "browse"
                  ? "border-campus-blue text-campus-blue"
                  : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
              )}
              onClick={() => setActiveTab("browse")}
            >
              Browse Teams
            </button>
            <button
              className={cn(
                "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                activeTab === "myTeams"
                  ? "border-campus-blue text-campus-blue"
                  : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
              )}
              onClick={() => setActiveTab("myTeams")}
            >
              My Teams
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-campus-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search teams by name or sport..."
              className="block w-full pl-10 pr-3 py-2 border border-campus-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Teams grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <div 
                key={team.id} 
                className="rounded-xl overflow-hidden border border-campus-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={team.avatar}
                    alt={team.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-campus-neutral-900 mb-1">
                      {team.sport}
                    </div>
                    <h3 className="text-xl font-bold text-white">{team.name}</h3>
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-campus-neutral-600 text-sm mb-4">{team.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-campus-neutral-50 rounded-md p-3 text-center">
                      <div className="text-sm text-campus-neutral-500">Members</div>
                      <div className="font-semibold text-campus-neutral-900">{team.members}</div>
                    </div>
                    <div className="bg-campus-neutral-50 rounded-md p-3 text-center">
                      <div className="text-sm text-campus-neutral-500">Win/Loss</div>
                      <div className="font-semibold text-campus-neutral-900">{team.wins}/{team.losses}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-campus-neutral-500 text-sm mb-4">
                    <Calendar className="h-4 w-4 mr-2 text-campus-neutral-400" />
                    <span>Next match: {team.nextMatch}</span>
                  </div>
                  
                  {team.isOwned ? (
                    <div className="flex gap-2">
                      <CustomButton 
                        variant="outline" 
                        className="flex-1"
                        iconLeft={<Edit className="h-4 w-4" />}
                      >
                        Edit
                      </CustomButton>
                      <CustomButton 
                        variant="outline" 
                        className="text-error border-error hover:bg-error hover:text-white"
                        iconLeft={<Trash className="h-4 w-4" />}
                      >
                        Delete
                      </CustomButton>
                    </div>
                  ) : (
                    <CustomButton variant="primary" className="w-full">
                      Join Team
                    </CustomButton>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="bg-campus-neutral-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-campus-neutral-400" />
              </div>
              {activeTab === "myTeams" ? (
                <div>
                  <p className="text-campus-neutral-700 text-lg font-medium mb-2">You haven't created or joined any teams yet</p>
                  <p className="text-campus-neutral-500 mb-4">Create a new team or browse existing teams to join.</p>
                  <CustomButton 
                    variant="primary" 
                    iconLeft={<UserPlus className="h-5 w-5" />}
                    onClick={() => setIsCreateTeamOpen(true)}
                  >
                    Create Team
                  </CustomButton>
                </div>
              ) : (
                <p className="text-campus-neutral-500 text-lg">No teams found matching your search. Try a different search term.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Teams;
