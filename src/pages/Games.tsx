
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Search, Filter, Calendar, MapPin, Users, Clock, Tag } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";

// Game categories
const categories = [
  "All Games",
  "Basketball",
  "Football",
  "Volleyball",
  "Tennis",
  "Badminton",
  "Table Tennis",
  "Cricket",
  "Swimming"
];

// Sample games data
const gamesData = [
  {
    id: 1,
    title: "Basketball Tournament",
    category: "Basketball",
    location: "Main Sports Complex",
    date: "May 15, 2023",
    time: "2:00 PM - 5:00 PM",
    playersNeeded: 10,
    description: "Inter-department basketball tournament. Teams of 5 players each.",
    image: "https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Football Match",
    category: "Football",
    location: "West Campus Field",
    date: "May 18, 2023",
    time: "3:30 PM - 5:30 PM",
    playersNeeded: 22,
    description: "Friendly football match between Computer Science and Engineering departments.",
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Tennis Singles",
    category: "Tennis",
    location: "Tennis Courts",
    date: "May 20, 2023",
    time: "10:00 AM - 12:00 PM",
    playersNeeded: 16,
    description: "Singles tennis tournament. All skill levels welcome.",
    image: "https://images.unsplash.com/photo-1595435934847-5ec0dafefa85?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Volleyball Competition",
    category: "Volleyball",
    location: "Indoor Sports Hall",
    date: "May 22, 2023",
    time: "1:00 PM - 4:00 PM",
    playersNeeded: 12,
    description: "Mixed volleyball competition. Teams of 6 players each.",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Table Tennis Tournament",
    category: "Table Tennis",
    location: "Recreation Center",
    date: "May 25, 2023",
    time: "3:00 PM - 6:00 PM",
    playersNeeded: 24,
    description: "Singles and doubles table tennis tournament.",
    image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Badminton Championship",
    category: "Badminton",
    location: "Multi-purpose Hall",
    date: "May 27, 2023",
    time: "2:30 PM - 6:30 PM",
    playersNeeded: 32,
    description: "Annual badminton championship. Singles and doubles categories available.",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop"
  }
];

const Games = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Games");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const filteredGames = gamesData.filter((game) => {
    // Filter by search query
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === "All Games" || game.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="pt-20 pb-16 bg-gradient-to-b from-campus-blue-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-campus-neutral-900 mb-4">Games & Events</h1>
          <p className="text-lg text-campus-neutral-600 max-w-2xl">
            Browse and join upcoming games and events happening on your campus. 
            Filter by category, date, or search for specific events.
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
              placeholder="Search games..."
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
        
        {/* Games grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div 
                key={game.id} 
                className="rounded-xl overflow-hidden border border-campus-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-campus-neutral-900">
                      <Tag className="h-3 w-3 mr-1" />
                      {game.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-campus-neutral-900 mb-2">{game.title}</h3>
                  <p className="text-campus-neutral-600 text-sm mb-4">{game.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{game.date}</span>
                    </div>
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{game.time}</span>
                    </div>
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{game.location}</span>
                    </div>
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Users className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{game.playersNeeded} players needed</span>
                    </div>
                  </div>
                  
                  <CustomButton variant="primary" className="w-full">
                    Join Event
                  </CustomButton>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-campus-neutral-500 text-lg">No games found matching your criteria. Try a different search or filter.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Games;
