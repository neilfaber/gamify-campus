
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
  sport: z.string().min(1, "Sport is required"),
  type: z.enum(["1v1", "team"], {
    required_error: "Please select a match type",
  }),
  location: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const sports = [
  "Basketball",
  "Football",
  "Volleyball",
  "Tennis",
  "Badminton",
  "Table Tennis",
  "Cricket",
  "Swimming"
];

const CreateMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sport: "Basketball",
      type: "1v1",
      location: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
    }
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a match",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the match
      const { data: match, error } = await supabase
        .from("matches")
        .insert({
          sport: values.sport,
          type: values.type,
          location: values.location || null,
          date: values.date || null,
          time: values.time || null,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating match:", error);
        toast({
          title: "Failed to create match",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Add the creator as a participant
      await supabase
        .from("match_participants")
        .insert({
          match_id: match.id,
          user_id: user.id,
          status: "accepted",  // Creator is automatically accepted
        });
      
      toast({
        title: "Match created successfully",
        description: `Your ${match.sport} match has been created`,
      });
      
      navigate(`/matchmaking/${match.id}`);
    } catch (err) {
      console.error("Error in create match flow:", err);
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
              onClick={() => navigate("/matchmaking")}
            >
              Back to Matchmaking
            </CustomButton>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden border border-campus-neutral-200 shadow-lg">
            <div className="p-6 md:p-8">
              <h1 className="text-2xl font-bold text-campus-neutral-900 mb-6">Create a New Match</h1>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="sport" className="block text-sm font-medium text-campus-neutral-700 mb-1">
                    Sport <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sport"
                    className="w-full border border-campus-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                    {...register("sport")}
                  >
                    {sports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                  {errors.sport && (
                    <p className="mt-1 text-sm text-red-500">{errors.sport.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-campus-neutral-700 mb-1">
                    Match Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="1v1"
                        className="form-radio h-4 w-4 text-campus-blue"
                        {...register("type")}
                      />
                      <span className="ml-2">1v1 Match</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="team"
                        className="form-radio h-4 w-4 text-campus-blue"
                        {...register("type")}
                      />
                      <span className="ml-2">Team Match</span>
                    </label>
                  </div>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-campus-neutral-700 mb-1">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      className="w-full border border-campus-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                      {...register("date")}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-campus-neutral-700 mb-1">
                      Time
                    </label>
                    <input
                      id="time"
                      type="text"
                      className="w-full border border-campus-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                      placeholder="e.g. 2:00 PM"
                      {...register("time")}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-campus-neutral-700 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    className="w-full border border-campus-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
                    placeholder="Enter match location"
                    {...register("location")}
                  />
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
                    Create Match
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

export default CreateMatch;
