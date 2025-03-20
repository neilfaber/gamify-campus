
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Search, User, Calendar, UserCheck, MapPin, Star, Clock, Activity, Users } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";

// Sample player data
const playersData = [
  {
    id: 1,
    name: "Alex Johnson",
    skill: 4.5,
    sports: ["Basketball", "Tennis"],
    availability: "Weekdays, Evenings",
    matches: 23,
    wins: 15,
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 2,
    name: "Jamie Smith",
    skill: 3.8,
    sports: ["Football", "Volleyball"],
    availability: "Weekends",
    matches: 17,
    wins: 9,
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    id: 3,
    name: "Taylor Williams",
    skill: 4.2,
    sports: ["Tennis", "Badminton"],
    availability: "Weekends, Afternoons",
    matches: 31,
    wins: 22,
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: 4,
    name: "Morgan Brown",
    skill: 3.9,
    sports: ["Basketball", "Football"],
    availability: "Weekdays, Mornings",
    matches: 19,
    wins: 12,
    avatar: "https://i.pravatar.cc/150?img=4"
  },
  {
    id: 5,
    name: "Casey Davis",
    skill: 4.7,
    sports: ["Volleyball", "Badminton"],
    availability: "Weekdays, Evenings",
    matches: 28,
    wins: 21,
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 6,
    name: "Riley Wilson",
    skill: 3.5,
    sports: ["Tennis", "Table Tennis"],
    availability: "Weekends, Mornings",
    matches: 15,
    wins: 7,
    avatar: "https://i.pravatar.cc/150?img=6"
  }
];

// Sample suggested matches
const suggestedMatches = [
  {
    id: 1,
    type: "1v1",
    sport: "Tennis",
    opponent: "Morgan Brown",
    opponentAvatar: "https://i.pravatar.cc/150?img=4",
    location: "Tennis Courts",
    date: "May 18, 2023",
    time: "2:00 PM",
    compatibilityScore: 95
  },
  {
    id: 2,
    type: "Team",
    sport: "Basketball",
    teamName: "The Rockets",
    players: 5,
    location: "Main Gym",
    date: "May 20, 2023",
    time: "4:30 PM",
    compatibilityScore: 88
  },
  {
    id: 3,
    type: "1v1",
    sport: "Badminton",
    opponent: "Casey Davis",
    opponentAvatar: "https://i.pravatar.cc/150?img=5",
    location: "Indoor Courts",
    date: "May 19, 2023",
    time: "3:15 PM",
    compatibilityScore: 92
  }
];

const Matchmaking = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"suggested" | "find">("suggested");
  
  const filteredPlayers = playersData.filter((player) => {
    return player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           player.sports.some(sport => sport.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <MainLayout>
      <div className="pt-20 pb-16 bg-gradient-to-b from-campus-blue-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-campus-neutral-900 mb-4">Smart Matchmaking</h1>
          <p className="text-lg text-campus-neutral-600 max-w-2xl">
            Find the perfect opponent or team based on your skill level, schedule, and preferences.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Tabs */}
        <div className="mb-8 border-b border-campus-neutral-200">
          <div className="flex -mb-px">
            <button
              className={cn(
                "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                activeTab === "suggested"
                  ? "border-campus-blue text-campus-blue"
                  : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
              )}
              onClick={() => setActiveTab("suggested")}
            >
              Suggested Matches
            </button>
            <button
              className={cn(
                "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                activeTab === "find"
                  ? "border-campus-blue text-campus-blue"
                  : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
              )}
              onClick={() => setActiveTab("find")}
            >
              Find Players
            </button>
          </div>
        </div>
        
        {activeTab === "suggested" ? (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedMatches.map((match) => (
                <div 
                  key={match.id} 
                  className="rounded-xl overflow-hidden border border-campus-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-campus-blue-light text-campus-blue mb-2">
                        {match.type} • {match.sport}
                      </div>
                      <h3 className="text-xl font-semibold text-campus-neutral-900">
                        {match.type === "1v1" ? `Match vs ${match.opponent}` : `Join ${match.teamName}`}
                      </h3>
                    </div>
                    <div className="flex items-center bg-campus-neutral-100 text-campus-neutral-800 rounded-full px-2 py-1">
                      <Star className="h-3.5 w-3.5 text-campus-blue mr-1" />
                      <span className="text-xs font-medium">{match.compatibilityScore}% Match</span>
                    </div>
                  </div>
                  
                  {match.type === "1v1" ? (
                    <div className="flex items-center mb-4">
                      <img 
                        src={match.opponentAvatar} 
                        alt={match.opponent}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-campus-neutral-900">{match.opponent}</div>
                        <div className="text-xs text-campus-neutral-500">Your recommended opponent</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-campus-blue flex items-center justify-center text-white mr-3">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-campus-neutral-900">{match.teamName}</div>
                        <div className="text-xs text-campus-neutral-500">{match.players} players</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{match.time}</span>
                    </div>
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{match.location}</span>
                    </div>
                  </div>
                  
                  <CustomButton variant="primary" className="w-full">
                    Accept Match
                  </CustomButton>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-campus-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search players by name or sport..."
                  className="block w-full pl-10 pr-3 py-2 border border-campus-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <div 
                  key={player.id} 
                  className="rounded-xl overflow-hidden border border-campus-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <img 
                      src={player.avatar} 
                      alt={player.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-campus-neutral-900">{player.name}</h3>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star 
                            key={index}
                            className={cn(
                              "h-4 w-4",
                              index < Math.floor(player.skill)
                                ? "text-campus-blue fill-campus-blue"
                                : index < player.skill
                                ? "text-campus-blue-light fill-campus-blue-light"
                                : "text-campus-neutral-300"
                            )}
                          />
                        ))}
                        <span className="ml-1 text-xs text-campus-neutral-500">{player.skill.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex items-start text-campus-neutral-700 text-sm">
                      <Activity className="h-4 w-4 mr-2 mt-0.5 text-campus-neutral-400" />
                      <div>
                        <span className="block text-campus-neutral-900 font-medium">Sports</span>
                        <span>{player.sports.join(", ")}</span>
                      </div>
                    </div>
                    <div className="flex items-start text-campus-neutral-700 text-sm">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 text-campus-neutral-400" />
                      <div>
                        <span className="block text-campus-neutral-900 font-medium">Availability</span>
                        <span>{player.availability}</span>
                      </div>
                    </div>
                    <div className="flex items-start text-campus-neutral-700 text-sm">
                      <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-campus-neutral-400" />
                      <div>
                        <span className="block text-campus-neutral-900 font-medium">Record</span>
                        <span>{player.wins} wins in {player.matches} matches</span>
                      </div>
                    </div>
                  </div>
                  
                  <CustomButton variant="outline" className="w-full">
                    Request Match
                  </CustomButton>
                </div>
              ))}
              
              {filteredPlayers.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <User className="h-12 w-12 text-campus-neutral-300 mx-auto mb-4" />
                  <p className="text-campus-neutral-500 text-lg">No players found matching your search. Try a different search term.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Matchmaking;
