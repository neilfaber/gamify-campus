
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/MainLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft } from "lucide-react";

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

interface Registration {
  id: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  
  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });
  
  // Check if user is registered for the event
  const { data: isRegistered, isLoading: regLoading } = useQuery({
    queryKey: ["eventRegistration", id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!id && !!user,
  });
  
  // Get list of registered users
  const { data: registrations = [] } = useQuery({
    queryKey: ["eventRegistrations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          user_id,
          profiles:user_id(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("event_id", id);
      
      if (error) throw error;
      return data as Registration[];
    },
    enabled: !!id,
  });
  
  const handleJoinEvent = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join events",
        variant: "destructive",
      });
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Register for the event
      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: id,
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
      
      // Refresh the page to show updated state
      window.location.reload();
    } catch (err) {
      console.error("Error in join event flow:", err);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleCancelRegistration = async () => {
    if (!user) return;
    
    setIsJoining(true);
    
    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", id)
        .eq("user_id", user.id);
        
      if (error) {
        console.error("Error canceling registration:", error);
        toast({
          title: "Failed to cancel registration",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Registration canceled",
        description: "You have been removed from this event",
      });
      
      // Refresh the page to show updated state
      window.location.reload();
    } catch (err) {
      console.error("Error in cancel registration flow:", err);
      toast({
        title: "An error occurred", 
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  if (eventLoading) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue mx-auto"></div>
          <p className="mt-4 text-campus-neutral-600">Loading event details...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!event) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <p className="text-red-500">Event not found.</p>
          <CustomButton 
            variant="outline"
            className="mt-4"
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate("/games")}
          >
            Back to Events
          </CustomButton>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <CustomButton 
              variant="outline"
              size="sm"
              iconLeft={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate("/games")}
            >
              Back to Events
            </CustomButton>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden border border-campus-neutral-200 shadow-lg">
            <div className="relative h-64 md:h-80 lg:h-96">
              <img
                src={event.image_url || "https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=1000&auto=format&fit=crop"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 text-campus-neutral-900 shadow-sm">
                  <Tag className="h-4 w-4 mr-1.5" />
                  {event.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <h1 className="text-3xl font-bold text-campus-neutral-900 mb-4">{event.title}</h1>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center text-campus-neutral-700">
                  <Calendar className="h-5 w-5 mr-3 text-campus-blue" />
                  <div>
                    <p className="text-sm text-campus-neutral-500">Date</p>
                    <p className="font-medium">{event.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-campus-neutral-700">
                  <Clock className="h-5 w-5 mr-3 text-campus-blue" />
                  <div>
                    <p className="text-sm text-campus-neutral-500">Time</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-campus-neutral-700">
                  <MapPin className="h-5 w-5 mr-3 text-campus-blue" />
                  <div>
                    <p className="text-sm text-campus-neutral-500">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-campus-neutral-600">{event.description}</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">Participants</h2>
                  <div className="flex items-center bg-campus-neutral-100 px-3 py-1.5 rounded-full">
                    <Users className="h-4 w-4 text-campus-blue mr-1.5" />
                    <span className="text-sm font-medium">{event.players_registered}/{event.players_needed} Registered</span>
                  </div>
                </div>
                
                {registrations.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {registrations.map((reg) => (
                      <div key={reg.id} className="flex items-center bg-campus-neutral-50 rounded-full px-3 py-1">
                        <div className="h-6 w-6 rounded-full bg-campus-blue-light text-campus-blue flex items-center justify-center mr-2 text-xs font-bold">
                          {reg.profiles?.full_name?.charAt(0) || reg.profiles?.username?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm">{reg.profiles?.full_name || reg.profiles?.username || 'Unknown User'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-campus-neutral-500">No participants yet. Be the first to join!</p>
                )}
              </div>
              
              {!regLoading && (
                <div className="flex justify-center mt-6">
                  {!isRegistered ? (
                    <CustomButton
                      variant="primary"
                      size="lg"
                      isLoading={isJoining}
                      disabled={isJoining || event.players_registered >= event.players_needed}
                      onClick={handleJoinEvent}
                    >
                      {event.players_registered >= event.players_needed ? "Event Full" : "Join Event"}
                    </CustomButton>
                  ) : (
                    <CustomButton
                      variant="outline"
                      size="lg"
                      isLoading={isJoining}
                      disabled={isJoining}
                      onClick={handleCancelRegistration}
                    >
                      Cancel Registration
                    </CustomButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetail;
