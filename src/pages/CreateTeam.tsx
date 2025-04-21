
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  logo_url: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const categories = [
  "Basketball",
  "Football",
  "Volleyball",
  "Tennis",
  "Badminton",
  "Table Tennis",
  "Cricket",
  "Swimming"
];

const CreateTeam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "Basketball",
      logo_url: "",
    }
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a team",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the team
      const { data: team, error } = await supabase
        .from("teams")
        .insert({
          name: values.name,
          description: values.description || null,
          category: values.category,
          logo_url: values.logo_url || null,
          leader_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating team:", error);
        toast({
          title: "Failed to create team",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Add the creator as a team member
      await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          status: "accepted",  // Team leader is automatically accepted
        });
      
      toast({
        title: "Team created successfully",
        description: `Your team "${team.name}" has been created`,
      });
      
      navigate(`/teams/${team.id}`);
    } catch (err) {
      console.error("Error in create team flow:", err);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="p-6 md:p-8">
              <h1 className="text-2xl font-bold text-campus-neutral-900 mb-6">Create a New Team</h1>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-campus-neutral-700 mb-1">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full border border-campus-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                    placeholder="Enter team name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-campus-neutral-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    className="w-full border border-campus-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                    {...register("category")}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-campus-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full border border-campus-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                    placeholder="Describe your team (optional)"
                    {...register("description")}
                  />
                </div>
                
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-campus-neutral-700 mb-1">
                    Team Logo URL
                  </label>
                  <input
                    id="logo_url"
                    type="text"
                    className="w-full border border-campus-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                    placeholder="Enter image URL for team logo (optional)"
                    {...register("logo_url")}
                  />
                  <p className="mt-1 text-xs text-campus-neutral-500">
                    Enter a URL for your team's logo image (optional)
                  </p>
                </div>
                
                <div className="pt-4">
                  <CustomButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Create Team
                  </CustomButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateTeam;
