
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/MainLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowLeft, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamLeader {
  id?: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  category: string;
  logo_url: string | null;
  leader_id: string | null;
  created_at: string | null;
  leader: TeamLeader | null;
  members_count?: number;
}

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  status: string;
  joined_at: string;
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  }
}

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  
  // Fetch team details
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          leader_profile:leader_id(
            id,
            username,
            full_name,
            avatar_url
          ),
          members:team_members(count)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Transform the data to match the Team interface
      return {
        ...data,
        leader: data.leader_profile?.[0] || null,
        members_count: data.members?.[0]?.count || 0
      } as Team;
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
        .order("status", { ascending: false })
        .order("joined_at", { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to include the profile correctly
      return data.map(member => ({
        ...member,
        profile: member.profile?.[0] || null
      })) as TeamMember[];
    },
    enabled: !!id,
  });
  
  // Check if user is a member
  const { data: userMembership } = useQuery({
    queryKey: ["user-membership", id, user?.id],
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
  
  const isTeamLeader = !!user && team?.leader_id === user.id;
  
  // Join team mutation
  const joinTeamMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("User not logged in or team ID missing");
      
      const { data, error } = await supabase
        .from("team_members")
        .insert({
          team_id: id,
          user_id: user.id,
          status: "pending"
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Request sent",
        description: "Your request to join the team has been sent",
      });
      
      // Refresh the page to show updated state
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error joining team:", error);
      toast({
        title: "Error",
        description: "Failed to join team. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Leave team mutation
  const leaveTeamMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id || !userMembership) 
        throw new Error("User not logged in or not a team member");
      
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", userMembership.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Team left",
        description: "You have left the team",
      });
      
      // Redirect to teams page
      navigate("/teams");
    },
    onError: (error) => {
      console.error("Error leaving team:", error);
      toast({
        title: "Error",
        description: "Failed to leave team. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update member status mutation
  const updateMemberStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string, status: string }) => {
      const { data, error } = await supabase
        .from("team_members")
        .update({ status })
        .eq("id", memberId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Member updated",
        description: "Member status has been updated",
      });
      
      // Refresh the members list
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error updating member status:", error);
      toast({
        title: "Error",
        description: "Failed to update member status. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleJoinTeam = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join teams",
        variant: "destructive",
      });
      navigate("/auth", { state: { from: `/teams/${id}` } });
      return;
    }
    
    setIsJoining(true);
    try {
      await joinTeamMutation.mutateAsync();
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeaveTeam = async () => {
    setIsJoining(true);
    try {
      await leaveTeamMutation.mutateAsync();
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleUpdateMemberStatus = async (memberId: string, status: string) => {
    try {
      await updateMemberStatusMutation.mutateAsync({ memberId, status });
    } catch (error) {
      console.error("Error updating member status:", error);
    }
  };
  
  if (teamLoading || authLoading) {
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
  
  const acceptedMembers = members.filter(m => m.status === "accepted");
  const pendingMembers = members.filter(m => m.status === "pending");
  
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
            <div className="h-32 bg-gradient-to-r from-campus-blue to-campus-blue-dark flex items-center justify-center relative">
              {team.logo_url ? (
                <img 
                  src={team.logo_url} 
                  alt={team.name} 
                  className="w-24 h-24 object-cover rounded-full border-4 border-white absolute -bottom-12"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white absolute -bottom-12 flex items-center justify-center">
                  <span className="text-3xl font-bold text-campus-blue">
                    {team.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-medium">
                {team.category}
              </div>
            </div>
            
            <div className="pt-16 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-3xl font-bold text-campus-neutral-900 mb-1 text-center md:text-left">
                    {team.name}
                  </h1>
                  <p className="text-campus-neutral-500 text-center md:text-left">
                    Led by {team.leader?.full_name || team.leader?.username || 'Unknown leader'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                    <div className="flex items-center text-campus-neutral-500 text-sm">
                      <Users className="h-4 w-4 mr-1.5" />
                      <span>{team.members_count} member{team.members_count !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {team.created_at && (
                      <div className="flex items-center text-campus-neutral-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center md:justify-end">
                  {!userMembership ? (
                    <CustomButton
                      variant="primary"
                      isLoading={isJoining}
                      disabled={isJoining || isTeamLeader}
                      onClick={handleJoinTeam}
                    >
                      {isTeamLeader ? "You are the leader" : "Join Team"}
                    </CustomButton>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-sm",
                        {
                          "bg-green-100 text-green-800": userMembership.status === "accepted",
                          "bg-yellow-100 text-yellow-800": userMembership.status === "pending"
                        }
                      )}>
                        {userMembership.status === "accepted" ? "Member" : "Request Pending"}
                      </div>
                      
                      <CustomButton
                        variant="outline"
                        isLoading={isJoining}
                        disabled={isJoining || isTeamLeader}
                        onClick={handleLeaveTeam}
                      >
                        {isTeamLeader ? "You are the leader" : "Leave Team"}
                      </CustomButton>
                    </div>
                  )}
                </div>
              </div>
              
              {team.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">About This Team</h2>
                  <p className="text-campus-neutral-700 whitespace-pre-line">
                    {team.description}
                  </p>
                </div>
              )}
              
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-6">Team Members</h2>
                
                {membersLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div>
                    {acceptedMembers.length > 0 ? (
                      <div className="space-y-3 mb-8">
                        {acceptedMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 bg-campus-neutral-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-campus-blue-light text-campus-blue flex items-center justify-center mr-3 text-sm font-bold">
                                {member.profile?.full_name?.charAt(0) || 
                                 member.profile?.username?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {member.profile?.full_name || 
                                   member.profile?.username || "Unknown User"}
                                </p>
                                <p className="text-sm text-campus-neutral-500">
                                  Joined {new Date(member.joined_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            {isTeamLeader && member.user_id !== team.leader_id && (
                              <CustomButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateMemberStatus(member.id, "remove")}
                              >
                                Remove
                              </CustomButton>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-campus-neutral-500 italic mb-8">No active members in this team yet.</p>
                    )}
                    
                    {isTeamLeader && pendingMembers.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-3">Pending Requests</h3>
                        <div className="space-y-3">
                          {pendingMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-campus-blue-light text-campus-blue flex items-center justify-center mr-3 text-sm font-bold">
                                  {member.profile?.full_name?.charAt(0) || 
                                   member.profile?.username?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {member.profile?.full_name || 
                                     member.profile?.username || "Unknown User"}
                                  </p>
                                  <p className="text-sm text-campus-neutral-500">
                                    Requested {new Date(member.joined_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <CustomButton
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleUpdateMemberStatus(member.id, "accepted")}
                                >
                                  Accept
                                </CustomButton>
                                <CustomButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateMemberStatus(member.id, "rejected")}
                                >
                                  Decline
                                </CustomButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
