
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/MainLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowLeft, Users, Calendar, Shield, Check, X } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string | null;
  category: string;
  leader_id: string;
  logo_url: string | null;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  status: string;
  joined_at: string;
  profile: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface JoinRequest {
  id: string;
  user_id: string;
  team_id: string;
  status: string;
  profile: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  // Fetch team details
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Team;
    },
    enabled: !!id,
  });
  
  // Fetch team members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["team-members", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          *,
          profile:user_id(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("team_id", id)
        .eq("status", "accepted");
      
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!id,
  });
  
  // Check if current user is a member
  const { data: userMembership } = useQuery({
    queryKey: ["team-user-membership", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });
  
  // Fetch pending join requests (for team leader)
  const { data: joinRequests = [] } = useQuery({
    queryKey: ["team-join-requests", id],
    queryFn: async () => {
      if (!user || !team || team.leader_id !== user.id) return [];
      
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          team_id,
          status,
          profile:user_id(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("team_id", id)
        .eq("status", "pending");
      
      if (error) throw error;
      return data as JoinRequest[];
    },
    enabled: !!id && !!user && !!team && team.leader_id === user.id,
  });
  
  // Join team mutation
  const joinTeamMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("team_members")
        .insert({
          team_id: id,
          user_id: user.id,
          status: "pending", // Pending until approved
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-user-membership", id, user?.id] });
      toast({
        title: "Join request sent",
        description: "Your request to join the team is pending approval.",
      });
    },
    onError: (error) => {
      console.error("Error joining team:", error);
      toast({
        title: "Failed to join team",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Leave team mutation
  const leaveTeamMutation = useMutation({
    mutationFn: async () => {
      if (!user || !userMembership) throw new Error("Not a team member");
      
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", userMembership.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-user-membership", id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["team-members", id] });
      toast({
        title: "Left team",
        description: "You have successfully left the team",
      });
    },
    onError: (error) => {
      console.error("Error leaving team:", error);
      toast({
        title: "Failed to leave team",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Handle join request responses (approve/reject)
  const handleJoinRequest = async (requestId: string, approve: boolean) => {
    if (!user || !team || team.leader_id !== user.id) return;
    
    try {
      if (approve) {
        // Approve the request
        const { error } = await supabase
          .from("team_members")
          .update({ status: "accepted" })
          .eq("id", requestId);
        
        if (error) throw error;
        
        toast({
          title: "Request approved",
          description: "The user has been added to your team",
        });
      } else {
        // Reject by deleting the request
        const { error } = await supabase
          .from("team_members")
          .delete()
          .eq("id", requestId);
        
        if (error) throw error;
        
        toast({
          title: "Request rejected",
          description: "The join request has been rejected",
        });
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["team-join-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["team-members", id] });
    } catch (error) {
      console.error("Error handling join request:", error);
      toast({
        title: "Error",
        description: "Failed to process the request",
        variant: "destructive",
      });
    }
  };
  
  // Handle team join
  const handleJoinTeam = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join teams",
        variant: "destructive",
      });
      return;
    }
    
    setIsJoining(true);
    try {
      await joinTeamMutation.mutateAsync();
    } finally {
      setIsJoining(false);
    }
  };
  
  // Handle team leave
  const handleLeaveTeam = async () => {
    if (!user || !userMembership) return;
    
    // Prevent team leader from leaving
    if (team && team.leader_id === user.id) {
      toast({
        title: "Cannot leave team",
        description: "Team leaders cannot leave their teams. Transfer leadership or delete the team first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLeaving(true);
    try {
      await leaveTeamMutation.mutateAsync();
    } finally {
      setIsLeaving(false);
    }
  };
  
  if (teamLoading) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue mx-auto"></div>
          <p className="mt-4 text-campus-neutral-600">Loading team details...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!team) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <p className="text-red-500">Team not found.</p>
          <CustomButton 
            variant="outline"
            className="mt-4"
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate("/teams")}
          >
            Back to Teams
          </CustomButton>
        </div>
      </MainLayout>
    );
  }

  const isTeamLeader = user && team.leader_id === user.id;
  const isMember = userMembership && userMembership.status === "accepted";
  const hasPendingRequest = userMembership && userMembership.status === "pending";
  
  return (
    <MainLayout>
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <CustomButton 
              variant="outline"
              size="sm"
              iconLeft={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate("/teams")}
            >
              Back to Teams
            </CustomButton>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden border border-campus-neutral-200 shadow-lg">
            <div className="h-48 bg-gradient-to-r from-campus-blue to-campus-blue-dark flex items-center justify-center relative">
              {team.logo_url ? (
                <img 
                  src={team.logo_url} 
                  alt={team.name} 
                  className="w-32 h-32 object-cover rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center">
                  <span className="text-4xl font-bold text-campus-blue">
                    {team.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-campus-neutral-900 mb-1">{team.name}</h1>
                  <div className="flex items-center">
                    <span className="text-campus-neutral-600 text-sm mr-3">{team.category}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-campus-neutral-100 text-xs font-medium text-campus-neutral-800">
                      <Users className="h-3 w-3 mr-1" />
                      {members.length} member{members.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                {!isTeamLeader && user && (
                  <div className="mt-4 md:mt-0">
                    {isMember ? (
                      <CustomButton
                        variant="outline"
                        size="sm"
                        isLoading={isLeaving}
                        onClick={handleLeaveTeam}
                      >
                        Leave Team
                      </CustomButton>
                    ) : hasPendingRequest ? (
                      <CustomButton
                        variant="outline"
                        size="sm"
                        disabled
                      >
                        Join Request Pending
                      </CustomButton>
                    ) : (
                      <CustomButton
                        variant="primary"
                        size="sm"
                        isLoading={isJoining}
                        onClick={handleJoinTeam}
                      >
                        Join Team
                      </CustomButton>
                    )}
                  </div>
                )}
              </div>
              
              {team.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">About</h2>
                  <p className="text-campus-neutral-600">{team.description}</p>
                </div>
              )}
              
              {/* Join requests (visible to team leader) */}
              {isTeamLeader && joinRequests.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Join Requests</h2>
                  <div className="space-y-3">
                    {joinRequests.map((request) => (
                      <div 
                        key={request.id}
                        className="flex items-center justify-between bg-campus-neutral-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-campus-blue-light text-campus-blue flex items-center justify-center mr-3 text-sm font-bold">
                            {request.profile?.full_name?.charAt(0) || request.profile?.username?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{request.profile?.full_name || request.profile?.username || 'Unknown User'}</p>
                            <p className="text-xs text-campus-neutral-500">Wants to join your team</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            iconLeft={<X className="h-4 w-4" />}
                            onClick={() => handleJoinRequest(request.id, false)}
                          >
                            Reject
                          </CustomButton>
                          
                          <CustomButton
                            variant="primary"
                            size="sm"
                            iconLeft={<Check className="h-4 w-4" />}
                            onClick={() => handleJoinRequest(request.id, true)}
                          >
                            Approve
                          </CustomButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Members list */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                {membersLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                ) : members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-campus-neutral-200"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-campus-blue-light text-campus-blue flex items-center justify-center mr-3 text-sm font-bold">
                            {member.profile?.full_name?.charAt(0) || member.profile?.username?.charAt(0) || '?'}
                          </div>
                          <p className="font-medium">
                            {member.profile?.full_name || member.profile?.username || 'Unknown User'}
                            {member.user_id === team.leader_id && (
                              <span className="ml-2 inline-flex items-center text-xs font-medium text-campus-blue">
                                <Shield className="h-3 w-3 mr-1" />
                                Team Leader
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="text-sm text-campus-neutral-500">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-campus-neutral-500">No members in this team yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeamDetail;
