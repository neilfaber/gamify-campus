
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/MainLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  sport: string;
  location: string | null;
  date: string | null;
  time: string | null;
  type: string;
  status: string;
  created_at: string;
  created_by: string;
  creator?: {
    username: string | null;
    full_name: string | null;
  };
}

interface Participant {
  id: string;
  match_id: string;
  user_id: string;
  team_id: string | null;
  status: string;
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  
  // Fetch match details
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ["match", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          creator:created_by(
            username,
            full_name
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Transform the data to include the creator properly
      return {
        ...data,
        creator: data.creator?.[0] || null
      } as Match;
    },
    enabled: !!id,
  });
  
  // Fetch participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ["match-participants", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_participants")
        .select(`
          *,
          profile:user_id(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("match_id", id);
        
      if (error) throw error;
      
      // Transform the data to include the profile correctly
      return data.map(participant => ({
        ...participant,
        profile: participant.profile?.[0] || null
      })) as Participant[];
    },
    enabled: !!id,
  });
  
  // Check if user is already a participant
  const { data: userParticipation } = useQuery({
    queryKey: ["user-participation", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("match_participants")
        .select("*")
        .eq("match_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });
  
  // Join match mutation
  const joinMatchMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("User not logged in or match ID missing");
      
      const { data, error } = await supabase
        .from("match_participants")
        .insert({
          match_id: id,
          user_id: user.id,
          status: "pending"
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
            subject: `Match Registration Request`,
            html: `
              <h1>Match Registration Request</h1>
              <p>You have requested to join a ${match?.sport} match.</p>
              <p>Status: Pending</p>
              <p>We will notify you once your participation is confirmed.</p>
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
        title: "Request sent",
        description: "Your request to join the match has been sent",
      });
      
      // Refresh the page to show updated state
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error joining match:", error);
      toast({
        title: "Error",
        description: "Failed to join match. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Withdraw from match
  const withdrawMatchMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id || !userParticipation) 
        throw new Error("User not logged in or not a participant");
      
      const { error } = await supabase
        .from("match_participants")
        .delete()
        .eq("id", userParticipation.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Withdrawn",
        description: "You have withdrawn from the match",
      });
      
      // Refresh the page to show updated state
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error withdrawing from match:", error);
      toast({
        title: "Error",
        description: "Failed to withdraw from match. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleJoinMatch = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join matches",
        variant: "destructive",
      });
      navigate("/auth", { state: { from: `/matchmaking/${id}` } });
      return;
    }
    
    setIsJoining(true);
    try {
      await joinMatchMutation.mutateAsync();
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleWithdraw = async () => {
    setIsJoining(true);
    try {
      await withdrawMatchMutation.mutateAsync();
    } finally {
      setIsJoining(false);
    }
  };
  
  if (matchLoading) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue mx-auto"></div>
          <p className="mt-4 text-campus-neutral-600">Loading match details...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!match) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <p className="text-red-500">Match not found.</p>
          <CustomButton 
            variant="outline"
            className="mt-4"
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate("/matchmaking")}
          >
            Back to Matchmaking
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
              onClick={() => navigate("/matchmaking")}
            >
              Back to Matchmaking
            </CustomButton>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden border border-campus-neutral-200 shadow-lg">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-campus-neutral-900 mb-1">
                    {match.sport} Match
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      {
                        "bg-yellow-100 text-yellow-800": match.status === "pending",
                        "bg-green-100 text-green-800": match.status === "accepted",
                        "bg-blue-100 text-blue-800": match.status === "completed",
                        "bg-red-100 text-red-800": match.status === "canceled",
                      }
                    )}>
                      {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </span>
                    <span className="text-sm text-campus-neutral-600">
                      {match.type === "1v1" ? "1v1 Match" : "Team Match"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {match.date && (
                  <div className="flex items-center text-campus-neutral-700">
                    <Calendar className="h-5 w-5 mr-3 text-campus-blue" />
                    <div>
                      <p className="text-sm text-campus-neutral-500">Date</p>
                      <p className="font-medium">{new Date(match.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {match.time && (
                  <div className="flex items-center text-campus-neutral-700">
                    <Clock className="h-5 w-5 mr-3 text-campus-blue" />
                    <div>
                      <p className="text-sm text-campus-neutral-500">Time</p>
                      <p className="font-medium">{match.time}</p>
                    </div>
                  </div>
                )}
                
                {match.location && (
                  <div className="flex items-center text-campus-neutral-700">
                    <MapPin className="h-5 w-5 mr-3 text-campus-blue" />
                    <div>
                      <p className="text-sm text-campus-neutral-500">Location</p>
                      <p className="font-medium">{match.location}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Participants</h2>
                  <div className="flex items-center bg-campus-neutral-100 px-3 py-1.5 rounded-full">
                    <Users className="h-4 w-4 text-campus-blue mr-1.5" />
                    <span className="text-sm font-medium">{participants.length} Participants</span>
                  </div>
                </div>
                
                {participantsLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : participants.length > 0 ? (
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-campus-neutral-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-campus-blue-light text-campus-blue flex items-center justify-center mr-3 text-sm font-bold">
                            {participant.profile?.full_name?.charAt(0) || participant.profile?.username?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{participant.profile?.full_name || participant.profile?.username || "Unknown User"}</p>
                            <span className={cn(
                              "inline-block px-2 py-0.5 text-xs rounded-full",
                              {
                                "bg-yellow-100 text-yellow-800": participant.status === "pending",
                                "bg-green-100 text-green-800": participant.status === "accepted",
                                "bg-red-100 text-red-800": participant.status === "rejected",
                              }
                            )}>
                              {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-campus-neutral-500 italic">No participants yet. Be the first to join!</p>
                )}
              </div>
              
              <div className="flex justify-center mt-6">
                {!userParticipation ? (
                  <CustomButton
                    variant="primary"
                    size="lg"
                    isLoading={isJoining}
                    disabled={isJoining || match.status !== "pending"}
                    onClick={handleJoinMatch}
                  >
                    {match.status !== "pending" ? "Match Not Accepting Players" : "Join Match"}
                  </CustomButton>
                ) : (
                  <CustomButton
                    variant="outline"
                    size="lg"
                    isLoading={isJoining}
                    disabled={isJoining}
                    onClick={handleWithdraw}
                  >
                    Withdraw from Match
                  </CustomButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MatchDetail;
