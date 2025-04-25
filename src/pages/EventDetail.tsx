
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/MainLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
  created_at: string;
}

interface Registration {
  id: string;
  user_id: string;
  profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);

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

  // Check if user is registered
  const { data: userRegistration } = useQuery({
    queryKey: ["user-registration", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  // Fetch registrations
  const { data: registrations = [] } = useQuery({
    queryKey: ["event-registrations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id, 
          user_id,
          profile:user_id(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("event_id", id);
        
      if (error) throw error;
      
      return data.map(reg => ({
        id: reg.id,
        user_id: reg.user_id,
        profile: reg.profile[0] || { username: null, full_name: null, avatar_url: null }
      })) as Registration[];
    },
    enabled: !!id,
  });

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("User not logged in or event ID missing");
      
      const { data, error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: id,
          user_id: user.id,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Send email notification
      try {
        await fetch(`https://qvujrueinyxoqfzafsbm.supabase.co/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dWpydWVpbnl4b3FmemFmc2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODU0NTcsImV4cCI6MjA1ODA2MTQ1N30.4qDTMgRwCSuYis8hg2EO_sDfyDXotI-FWBRu0DKrehI`
          },
          body: JSON.stringify({
            to: user.email,
            subject: `Registration Successful - ${event?.title}`,
            html: `
              <h1>Event Registration Confirmation</h1>
              <p>Hello ${user.user_metadata?.full_name || user.email},</p>
              <p>You have successfully registered for ${event?.title}!</p>
              <p><strong>Event Details:</strong></p>
              <p>Date: ${event?.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</p>
              <p>Time: ${event?.time || 'N/A'}</p>
              <p>Location: ${event?.location || 'N/A'}</p>
              <p>We look forward to seeing you there!</p>
            `
          })
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "You have successfully registered for this event",
      });
      
      // Refresh the page to show updated state
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration failed",
        description: "Failed to register for event. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Cancel registration mutation
  const cancelRegistrationMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id || !userRegistration) 
        throw new Error("User not logged in or not registered");
      
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", userRegistration.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Registration cancelled",
        description: "You have cancelled your registration for this event",
      });
      
      // Refresh the page to show updated state
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error cancelling registration:", error);
      toast({
        title: "Error",
        description: "Failed to cancel registration. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      navigate("/auth", { state: { from: `/events/${id}` } });
      return;
    }
    
    setIsRegistering(true);
    try {
      await registerMutation.mutateAsync();
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleCancelRegistration = async () => {
    setIsRegistering(true);
    try {
      await cancelRegistrationMutation.mutateAsync();
    } finally {
      setIsRegistering(false);
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
            onClick={() => navigate("/events")}
          >
            Back to Events
          </CustomButton>
        </div>
      </MainLayout>
    );
  }
  
  const isRegistered = !!userRegistration;
  const isFull = event.players_registered >= event.players_needed;
  const registrationsLeft = event.players_needed - event.players_registered;
  
  return (
    <MainLayout>
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <CustomButton 
              variant="outline"
              size="sm"
              iconLeft={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate("/events")}
            >
              Back to Events
            </CustomButton>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden border border-campus-neutral-200 shadow-lg">
            {event.image_url ? (
              <div className="w-full h-64 md:h-80 bg-campus-neutral-100 relative">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-campus-blue text-white mb-2">
                    {event.category}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-gradient-to-r from-campus-blue to-campus-blue-dark flex items-center justify-center">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white text-campus-blue">
                  {event.category}
                </div>
              </div>
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-3xl font-bold text-campus-neutral-900 mb-1">
                    {event.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-campus-neutral-600">
                      {registrationsLeft > 0 
                        ? `${registrationsLeft} spots left` 
                        : "Event is full"}
                    </span>
                    {isFull && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Full
                      </span>
                    )}
                  </div>
                </div>
                
                {!isRegistered ? (
                  <CustomButton
                    variant="primary"
                    size="lg"
                    isLoading={isRegistering}
                    disabled={isRegistering || isFull}
                    onClick={handleRegister}
                  >
                    {isFull ? "Event is Full" : "Register Now"}
                  </CustomButton>
                ) : (
                  <CustomButton
                    variant="outline"
                    size="lg"
                    isLoading={isRegistering}
                    disabled={isRegistering}
                    onClick={handleCancelRegistration}
                  >
                    Cancel Registration
                  </CustomButton>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center text-campus-neutral-700">
                  <Calendar className="h-5 w-5 mr-3 text-campus-blue" />
                  <div>
                    <p className="text-sm text-campus-neutral-500">Date</p>
                    <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
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
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                <p className="text-campus-neutral-700 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Participants</h2>
                  <div className="flex items-center bg-campus-neutral-100 px-3 py-1.5 rounded-full">
                    <Users className="h-4 w-4 text-campus-blue mr-1.5" />
                    <span className="text-sm font-medium">{event.players_registered} / {event.players_needed}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {registrations.length > 0 ? (
                    registrations.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-3 bg-campus-neutral-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-campus-blue-light text-campus-blue flex items-center justify-center mr-3 text-sm font-bold">
                            {registration.profile?.full_name?.charAt(0) || 
                             registration.profile?.username?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">
                              {registration.profile?.full_name || 
                               registration.profile?.username || "Anonymous User"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-campus-neutral-500 italic">No participants yet. Be the first to register!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetail;
