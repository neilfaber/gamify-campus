import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Search, Filter, Calendar, MapPin, Users, Clock, Tag } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  players_needed: number;
  players_registered: number;
  image_url: string | null;
}

const Games = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Games");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch events
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
      
      return data as Event[];
    },
  });
  
  // Handle joining events
  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join events",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if user is already registered
      const { data: existingReg } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();
        
      if (existingReg) {
        toast({
          title: "Already registered",
          description: "You have already joined this event",
        });
        return;
      }
      
      // Register for the event
      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          user_id: user.id,
        });
        
      if (error) {
        console.error("Error joining event:", error);
        toast({
          title: "Failed to join event",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Send confirmation email
      const event = events.find(e => e.id === eventId);
      if (event) {
        try {
          await fetch(`https://qvujrueinyxoqfzafsbm.supabase.co/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dWpydWVpbnl4b3FmemFmc2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODU0NTcsImV4cCI6MjA1ODA2MTQ1N30.4qDTMgRwCSuYis8hg2EO_sDfyDXotI-FWBRu0DKrehI`
            },
            body: JSON.stringify({
              to: user.email,
              subject: `Registered for ${event.title}`,
              html: `
                <h1>Event Registration Confirmation</h1>
                <p>You have successfully registered for ${event.title}.</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p>We look forward to seeing you there!</p>
              `
            })
          });
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
      
      toast({
        title: "Successfully joined event",
        description: "You have been registered for this event",
      });
    } catch (err) {
      console.error("Error in join event flow:", err);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };
  
  const filteredEvents = events.filter((event) => {
    // Filter by search query
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === "All Games" || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue mx-auto"></div>
          <p className="mt-4 text-campus-neutral-600">Loading events...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <p className="text-red-500">Error loading events. Please try again later.</p>
        </div>
      </MainLayout>
    );
  }

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
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="rounded-xl overflow-hidden border border-campus-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image_url || "https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=1000&auto=format&fit=crop"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-campus-neutral-900">
                      <Tag className="h-3 w-3 mr-1" />
                      {event.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-campus-neutral-900 mb-2">{event.title}</h3>
                  <p className="text-campus-neutral-600 text-sm mb-4">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Users className="h-4 w-4 mr-2 text-campus-neutral-400" />
                      <span>{event.players_registered}/{event.players_needed} players registered</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/games/${event.id}`} className="flex-1">
                      <CustomButton variant="outline" className="w-full">
                        Details
                      </CustomButton>
                    </Link>
                    <CustomButton 
                      variant="primary" 
                      className="flex-1"
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={event.players_registered >= event.players_needed}
                    >
                      {event.players_registered >= event.players_needed ? "Full" : "Join Event"}
                    </CustomButton>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-campus-neutral-500 text-lg">No events found matching your criteria. Try a different search or filter.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Games;
