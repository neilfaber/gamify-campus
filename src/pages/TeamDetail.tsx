import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import { CustomButton } from '@/components/ui/custom-button';
import { Users, Calendar, ArrowLeft, Check, X } from 'lucide-react';

interface TeamLeader {
  username: string | null;
  full_name: string | null;
  avatar_url?: string | null;
}

interface UserProfile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  status: string;
  joined_at: string;
  profile: UserProfile;
}

interface JoinRequest {
  id: string;
  user_id: string;
  team_id: string;
  status: string;
  profile: UserProfile;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  category: string;
  logo_url: string | null;
  leader_id: string;
  created_at: string;
  leader: TeamLeader | null;
}

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  
  // Fetch team details
  const { data: team, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          leader_profile:leader_id(username, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        leader: data.leader_profile?.[0] || null
      } as Team;
    },
    enabled: !!id,
  });
  
  // Fetch team members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profile:user_id(username, full_name, avatar_url)
        `)
        .eq('team_id', id)
        .eq('status', 'accepted');
      
      if (error) throw error;
      
      // Transform data to match TeamMember interface
      return data.map((member: any) => ({
        ...member,
        profile: member.profile?.[0] || { username: null, full_name: null, avatar_url: null }
      })) as TeamMember[];
    },
    enabled: !!id,
  });
  
  // Check if current user is a member or has pending request
  const { data: userMembership } = useQuery({
    queryKey: ['user-team-membership', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });
  
  // Fetch pending join requests (only for team leader)
  const { data: joinRequests = [] } = useQuery({
    queryKey: ['team-join-requests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profile:user_id(username, full_name, avatar_url)
        `)
        .eq('team_id', id)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Transform data to match JoinRequest interface
      return data.map((request: any) => ({
        ...request,
        profile: request.profile?.[0] || { username: null, full_name: null, avatar_url: null }
      })) as JoinRequest[];
    },
    enabled: !!id && !!user && !!team && user.id === team.leader_id,
  });
  
  // Join team mutation
  const joinTeamMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('User not logged in or team ID missing');
      
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: id,
          user_id: user.id,
          status: 'pending'
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Join request sent',
        description: 'Team leader will review your request',
      });
      setJoinRequestSent(true);
      queryClient.invalidateQueries({ queryKey: ['user-team-membership', id, user?.id] });
    },
    onError: (error: any) => {
      console.error('Error joining team:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Leave team mutation
  const leaveTeamMutation = useMutation({
    mutationFn: async () => {
      if (!userMembership?.id) throw new Error('Not a team member');
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', userMembership.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Left team',
        description: 'You have left the team',
      });
      queryClient.invalidateQueries({ queryKey: ['user-team-membership', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['team-members', id] });
    },
    onError: (error: any) => {
      console.error('Error leaving team:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle join/request logic
  const handleJoinTeam = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to join teams',
        variant: 'destructive',
      });
      return;
    }
    
    await joinTeamMutation.mutateAsync();
  };
  
  // Handle leave team
  const handleLeaveTeam = async () => {
    if (confirm('Are you sure you want to leave this team?')) {
      await leaveTeamMutation.mutateAsync();
    }
  };
  
  // Handle request approval/rejection (for team leader)
  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    if (!user || !team || user.id !== team.leader_id) return;
    
    try {
      if (action === 'accept') {
        await supabase
          .from('team_members')
          .update({ status: 'accepted' })
          .eq('id', requestId);
          
        toast({
          title: 'Request approved',
          description: 'User has been added to the team',
        });
      } else {
        await supabase
          .from('team_members')
          .delete()
          .eq('id', requestId);
          
        toast({
          title: 'Request rejected',
          description: 'Join request has been rejected',
        });
      }
      
      // Refresh requests and members
      queryClient.invalidateQueries({ queryKey: ['team-join-requests', id] });
      queryClient.invalidateQueries({ queryKey: ['team-members', id] });
    } catch (error: any) {
      console.error(`Error ${action === 'accept' ? 'approving' : 'rejecting'} request:`, error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Loading state
  if (isLoadingTeam) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue mx-auto"></div>
          <p className="mt-4 text-campus-neutral-600">Loading team details...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Team not found
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
  
  const isLeader = user?.id === team.leader_id;
  const isMember = userMembership?.status === 'accepted';
  const hasPendingRequest = userMembership?.status === 'pending';
  
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
            {/* Team header with logo/banner */}
            <div className="h-48 bg-gradient-to-r from-campus-blue to-campus-blue-dark flex items-center justify-center">
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-campus-neutral-900">{team.name}</h1>
                    <span className="ml-4 px-3 py-1 bg-campus-neutral-100 rounded-full text-sm">
                      {team.category}
                    </span>
                  </div>
                  <p className="text-campus-neutral-500 mt-2">
                    Created {new Date(team.created_at).toLocaleDateString()} • 
                    Led by {team.leader?.full_name || team.leader?.username || 'Unknown'}
                  </p>
                </div>
                
                {/* Join/Leave buttons */}
                {!isLeader && !joinRequestSent && (
                  <div className="mt-4 md:mt-0">
                    {!isMember && !hasPendingRequest ? (
                      <CustomButton
                        variant="primary"
                        onClick={handleJoinTeam}
                        isLoading={joinTeamMutation.isPending}
                      >
                        Join Team
                      </CustomButton>
                    ) : isMember ? (
                      <CustomButton
                        variant="outline"
                        onClick={handleLeaveTeam}
                        isLoading={leaveTeamMutation.isPending}
                      >
                        Leave Team
                      </CustomButton>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Join Request Pending
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Team description */}
              {team.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">About</h2>
                  <p className="text-campus-neutral-600">{team.description}</p>
                </div>
              )}
              
              {/* Team members section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Team Members</h2>
                  <div className="flex items-center bg-campus-neutral-100 px-3 py-1 rounded-full">
                    <Users className="h-4 w-4 text-campus-blue mr-1.5" />
                    <span className="text-sm">{members.length} Members</span>
                  </div>
                </div>
                
                {isLoadingMembers ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-12 bg-campus-neutral-100 rounded"></div>
                    <div className="h-12 bg-campus-neutral-100 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Team leader */}
                    <div className="flex items-center justify-between p-3 bg-campus-blue-light/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-campus-blue text-white flex items-center justify-center mr-3 font-bold">
                          {team.leader?.full_name?.charAt(0) || team.leader?.username?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{team.leader?.full_name || team.leader?.username || 'Unknown'}</p>
                          <span className="text-sm text-campus-neutral-500">Team Leader</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Other members */}
                    {members.length > 0 ? (
                      members
                        .filter(member => member.user_id !== team.leader_id) // Exclude leader
                        .map(member => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-campus-neutral-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-campus-neutral-200 text-campus-neutral-600 flex items-center justify-center mr-3 font-bold">
                                {member.profile?.full_name?.charAt(0) || member.profile?.username?.charAt(0) || '?'}
                              </div>
                              <p className="font-medium">{member.profile?.full_name || member.profile?.username || 'Unknown User'}</p>
                            </div>
                            
                            {isLeader && (
                              <CustomButton
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Remove this member from the team?')) {
                                    supabase
                                      .from('team_members')
                                      .delete()
                                      .eq('id', member.id)
                                      .then(() => {
                                        queryClient.invalidateQueries({ queryKey: ['team-members', id] });
                                        toast({
                                          title: 'Member removed',
                                          description: 'Team member has been removed',
                                        });
                                      });
                                  }
                                }}
                              >
                                Remove
                              </CustomButton>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-campus-neutral-500 italic">No other members yet</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Join requests section (only visible to leader) */}
              {isLeader && joinRequests && joinRequests.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Pending Join Requests</h2>
                  
                  <div className="space-y-3">
                    {joinRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center mr-3 font-bold">
                            {request.profile?.full_name?.charAt(0) || request.profile?.username?.charAt(0) || '?'}
                          </div>
                          <p className="font-medium">{request.profile?.full_name || request.profile?.username || 'Unknown User'}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            iconLeft={<Check className="h-4 w-4 text-green-500" />}
                            onClick={() => handleRequestAction(request.id, 'accept')}
                          >
                            Accept
                          </CustomButton>
                          
                          <CustomButton
                            variant="outline"
                            size="sm"
                            iconLeft={<X className="h-4 w-4 text-red-500" />}
                            onClick={() => handleRequestAction(request.id, 'reject')}
                          >
                            Reject
                          </CustomButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeamDetail;
