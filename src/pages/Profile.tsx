
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Award, Calendar, Camera, Edit, Mail, MapPin, Phone, Save, Trophy, User, Users } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "stats" | "achievements">("info");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    phone: "+1 (555) 123-4567", // Sample data
    location: "North Campus", // Sample data
  });

  // Sample data for stats and achievements
  const sampleStats = {
    matchesPlayed: 35,
    wins: 22,
    losses: 13,
    teamsJoined: 2,
    certificatesEarned: 4
  };

  const sampleAchievements = [
    { title: "Basketball Tournament Winner", date: "Mar 2023", icon: <Trophy className="h-5 w-5" /> },
    { title: "Tennis Singles Finalist", date: "Feb 2023", icon: <Award className="h-5 w-5" /> },
    { title: "Team Captain - Slam Dunkers", date: "Jan 2023", icon: <Users className="h-5 w-5" /> }
  ];

  const sampleSports = [
    { name: "Basketball", level: "Advanced", years: 4 },
    { name: "Tennis", level: "Intermediate", years: 2 },
    { name: "Volleyball", level: "Beginner", years: 1 }
  ];

  const sampleAvailability = {
    weekdays: ["Evening"],
    weekends: ["Morning", "Afternoon"]
  };

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch profile data
  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProfileData(data);
          setFormData({
            username: data.username || '',
            full_name: data.full_name || '',
            bio: data.bio || '',
            phone: "+1 (555) 123-4567", // Sample data
            location: "North Campus", // Sample data
          });
        }
      } catch (error: any) {
        toast({
          title: "Error fetching profile",
          description: error.message || "Could not fetch profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [user, toast]);

  const handleSaveProfile = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Update local state
      if (profileData) {
        setProfileData({
          ...profileData,
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        });
      }

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Could not update profile",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-campus-blue border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user || !profileData) {
    return (
      <MainLayout>
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-campus-neutral-700">Profile not found</h2>
            <p className="mt-2 text-campus-neutral-500">Please sign in to view your profile</p>
            <CustomButton 
              variant="primary" 
              className="mt-4"
              onClick={() => navigate("/auth")}
            >
              Go to Sign In
            </CustomButton>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="pt-20 bg-campus-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Profile header */}
          <div className="flex flex-col items-center md:flex-row md:items-end pb-16 pt-10 md:pb-20 md:pt-16 text-white">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white">
                <img
                  src={profileData.avatar_url || "https://i.pravatar.cc/300?img=8"}
                  alt={profileData.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-campus-blue text-white p-2 rounded-full border-2 border-white">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{profileData.full_name || "New User"}</h1>
              <p className="text-blue-100 max-w-xl mt-2">{profileData.bio || "No bio yet. Edit your profile to add one!"}</p>
            </div>
            
            <div className="mt-6 md:mt-0 md:ml-auto">
              <CustomButton
                variant={isEditing ? "secondary" : "outline"}
                className={isEditing ? "" : "bg-white/10 border-white/30 text-white hover:bg-white/20"}
                iconLeft={isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? "Save Profile" : "Edit Profile"}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border-b border-campus-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto -mb-px">
            <button
              className={cn(
                "py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "info"
                  ? "border-campus-blue text-campus-blue"
                  : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
              )}
              onClick={() => setActiveTab("info")}
            >
              Personal Info
            </button>
            <button
              className={cn(
                "py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "stats"
                  ? "border-campus-blue text-campus-blue"
                  : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
              )}
              onClick={() => setActiveTab("stats")}
            >
              Performance Stats
            </button>
            <button
              className={cn(
                "py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === "achievements"
                  ? "border-campus-blue text-campus-blue"
                  : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
              )}
              onClick={() => setActiveTab("achievements")}
            >
              Achievements
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
            {/* Contact information */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-campus-neutral-900 mb-4">Contact Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-campus-neutral-400 mt-0.5 mr-3" />
                    <div>
                      <div className="text-sm text-campus-neutral-500">Email</div>
                      <div className="text-campus-neutral-900">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-campus-neutral-400 mt-0.5 mr-3" />
                    <div>
                      <div className="text-sm text-campus-neutral-500">Username</div>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="username"
                          className="mt-1 block w-full"
                          value={formData.username}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="text-campus-neutral-900">{profileData.username}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-campus-neutral-400 mt-0.5 mr-3" />
                    <div>
                      <div className="text-sm text-campus-neutral-500">Phone</div>
                      {isEditing ? (
                        <Input
                          type="tel"
                          name="phone"
                          className="mt-1 block w-full"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="text-campus-neutral-900">{formData.phone}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-campus-neutral-400 mt-0.5 mr-3" />
                    <div>
                      <div className="text-sm text-campus-neutral-500">Location</div>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="location"
                          className="mt-1 block w-full"
                          value={formData.location}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="text-campus-neutral-900">{formData.location}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm mt-6">
                <h2 className="text-lg font-semibold text-campus-neutral-900 mb-4">Availability</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-campus-neutral-700 mb-2">Weekdays</div>
                    <div className="flex flex-wrap gap-2">
                      {["Morning", "Afternoon", "Evening"].map((time) => (
                        <label 
                          key={`weekday-${time}`}
                          className={cn(
                            "inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors",
                            sampleAvailability.weekdays.includes(time)
                              ? "bg-campus-blue text-white"
                              : "bg-campus-neutral-100 text-campus-neutral-600 hover:bg-campus-neutral-200"
                          )}
                        >
                          {isEditing && (
                            <input
                              type="checkbox"
                              className="sr-only"
                              defaultChecked={sampleAvailability.weekdays.includes(time)}
                            />
                          )}
                          {time}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-campus-neutral-700 mb-2">Weekends</div>
                    <div className="flex flex-wrap gap-2">
                      {["Morning", "Afternoon", "Evening"].map((time) => (
                        <label 
                          key={`weekend-${time}`}
                          className={cn(
                            "inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors",
                            sampleAvailability.weekends.includes(time)
                              ? "bg-campus-blue text-white"
                              : "bg-campus-neutral-100 text-campus-neutral-600 hover:bg-campus-neutral-200"
                          )}
                        >
                          {isEditing && (
                            <input
                              type="checkbox"
                              className="sr-only"
                              defaultChecked={sampleAvailability.weekends.includes(time)}
                            />
                          )}
                          {time}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sports and bio */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-campus-neutral-900 mb-4">About Me</h2>
                
                {isEditing ? (
                  <Textarea
                    name="bio"
                    className="block w-full mb-4"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself and your sports interests..."
                  />
                ) : (
                  <p className="text-campus-neutral-700 mb-6">{profileData.bio || "No bio yet. Edit your profile to add one!"}</p>
                )}
                
                <h3 className="text-md font-semibold text-campus-neutral-900 mb-3">Sports & Skill Level</h3>
                
                {sampleSports.map((sport, index) => (
                  <div 
                    key={sport.name}
                    className={cn("p-4 border border-campus-neutral-200 rounded-lg", index > 0 && "mt-4")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-campus-neutral-900">{sport.name}</div>
                      {isEditing ? (
                        <select
                          className="block w-32 px-2 py-1 text-sm border border-campus-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                          defaultValue={sport.level}
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </select>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-campus-blue-light text-campus-blue">
                          {sport.level}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-sm text-campus-neutral-500">
                      {isEditing ? (
                        <div className="flex items-center">
                          <span className="mr-2">Years of experience:</span>
                          <Input
                            type="number"
                            className="block w-16 px-2 py-1 text-sm"
                            defaultValue={sport.years}
                            min="0"
                            max="20"
                          />
                        </div>
                      ) : (
                        <span>{sport.years} {sport.years === 1 ? 'year' : 'years'} of experience</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {isEditing && (
                  <CustomButton
                    variant="outline"
                    className="mt-4"
                    iconLeft={<User className="h-4 w-4" />}
                  >
                    Add Another Sport
                  </CustomButton>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "stats" && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Matches Played", value: sampleStats.matchesPlayed, color: "blue" },
                { label: "Wins", value: sampleStats.wins, color: "green" },
                { label: "Losses", value: sampleStats.losses, color: "red" },
                { label: "Teams Joined", value: sampleStats.teamsJoined, color: "purple" },
                { label: "Certificates", value: sampleStats.certificatesEarned, color: "orange" }
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm text-center"
                >
                  <div className={`text-3xl font-bold text-campus-${stat.color === "blue" ? "blue" : stat.color === "green" ? "success" : stat.color === "red" ? "error" : stat.color === "purple" ? "blue-dark" : "warning"}`}>
                    {stat.value}
                  </div>
                  <div className="text-campus-neutral-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-campus-neutral-900 mb-6">Performance Visualization</h2>
              
              <div className="h-80 flex items-center justify-center bg-campus-neutral-50 rounded-lg">
                <p className="text-campus-neutral-500">Performance graphs and statistics will be displayed here.</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "achievements" && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-campus-neutral-900 mb-6">Achievements & Certificates</h2>
              
              <div className="space-y-6">
                {sampleAchievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start p-5 border border-campus-neutral-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="p-3 rounded-full bg-campus-blue-light text-campus-blue mr-4">
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="text-lg font-medium text-campus-neutral-900">{achievement.title}</div>
                      <div className="flex items-center mt-1 text-sm text-campus-neutral-500">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>{achievement.date}</span>
                      </div>
                    </div>
                    <CustomButton
                      variant="link"
                      className="ml-auto"
                    >
                      View Certificate
                    </CustomButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
