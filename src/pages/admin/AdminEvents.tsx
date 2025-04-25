
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/AdminLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Search, Plus, Edit, Trash, Calendar, MapPin, Clock, Users } from "lucide-react";

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

const AdminEvents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<Omit<Event, "id" | "players_registered">>();
  
  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (values: Omit<Event, "id" | "players_registered">) => {
      const { data, error } = await supabase
        .from("events")
        .insert([values])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Event created",
        description: "The event was created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (values: Partial<Event> & { id: string }) => {
      const { id, ...rest } = values;
      const { data, error } = await supabase
        .from("events")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setEditingEvent(null);
      form.reset();
      toast({
        title: "Event updated",
        description: "The event was updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({
        title: "Event deleted",
        description: "The event was deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: Omit<Event, "id" | "players_registered">) => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, ...values });
    } else {
      createEventMutation.mutate(values);
    }
  };
  
  // Open edit modal
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      date: event.date,
      time: event.time,
      players_needed: event.players_needed,
      image_url: event.image_url || "",
    });
    setIsCreateModalOpen(true);
  };
  
  // Open create modal
  const handleCreate = () => {
    setEditingEvent(null);
    form.reset({
      title: "",
      description: "",
      category: "Basketball",
      location: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      players_needed: 0,
      image_url: "",
    });
    setIsCreateModalOpen(true);
  };
  
  // Filter events by search
  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.category.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Events Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-campus-neutral-500 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search events..."
                className="pl-9 py-2 pr-4 border rounded-md w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <CustomButton
              variant="primary"
              iconLeft={<Plus className="h-4 w-4" />}
              onClick={handleCreate}
            >
              Create Event
            </CustomButton>
          </div>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div 
                  key={event.id}
                  className="bg-white rounded-lg border border-campus-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold mb-1">{event.title}</h2>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-campus-neutral-100 text-campus-neutral-800">
                          {event.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center mt-4 sm:mt-0 gap-2">
                        <CustomButton
                          variant="outline"
                          size="sm"
                          iconLeft={<Edit className="h-4 w-4" />}
                          onClick={() => handleEdit(event)}
                        >
                          Edit
                        </CustomButton>
                        
                        <CustomButton
                          variant="outline"
                          size="sm"
                          iconLeft={<Trash className="h-4 w-4" />}
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this event?")) {
                              deleteEventMutation.mutate(event.id);
                            }
                          }}
                        >
                          Delete
                        </CustomButton>
                      </div>
                    </div>
                    
                    <p className="text-campus-neutral-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center text-campus-neutral-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                        <span>{event.date}</span>
                      </div>
                      
                      <div className="flex items-center text-campus-neutral-500 text-sm">
                        <Clock className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-campus-neutral-500 text-sm">
                        <MapPin className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center text-campus-neutral-500 text-sm">
                        <Users className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                        <span>{event.players_registered}/{event.players_needed} Registered</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-campus-neutral-500">No events found. Create a new event to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                {...form.register("title", { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Event title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...form.register("category", { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Basketball">Basketball</option>
                <option value="Football">Football</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Tennis">Tennis</option>
                <option value="Badminton">Badminton</option>
                <option value="Table Tennis">Table Tennis</option>
                <option value="Cricket">Cricket</option>
                <option value="Swimming">Swimming</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  {...form.register("date", { required: true })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  {...form.register("time", { required: true })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g. 2:00 PM - 5:00 PM"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                {...form.register("location", { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Event location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Players Needed
              </label>
              <input
                type="number"
                {...form.register("players_needed", { 
                  required: true,
                  valueAsNumber: true,
                  min: 1
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Number of players"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...form.register("description", { required: true })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Event description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                {...form.register("image_url")}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="mr-2"
              >
                Cancel
              </CustomButton>
              
              <CustomButton
                type="submit"
                variant="primary"
                isLoading={createEventMutation.isPending || updateEventMutation.isPending}
              >
                {editingEvent ? "Update Event" : "Create Event"}
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminEvents;
