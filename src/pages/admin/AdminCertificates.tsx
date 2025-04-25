
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/AdminLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Search, Plus, Edit, Trash, User } from "lucide-react";

interface Certificate {
  id: string;
  title: string;
  event: string;
  issue_date: string;
  type: string;
  image_url: string | null;
  user_id: string;
  user?: {
    email?: string;
    username?: string;
    full_name?: string;
  };
}

const AdminCertificates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<Omit<Certificate, "id">>();
  
  // Fetch certificates
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          user:user_id (
            email,
            username:profiles!inner(username),
            full_name:profiles!inner(full_name)
          )
        `)
        .order("issue_date", { ascending: false });
      
      if (error) throw error;
      return data as Certificate[];
    },
  });
  
  // Fetch users for dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users-dropdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          full_name,
          auth_user:id(email)
        `)
        .order("full_name");
      
      if (error) throw error;
      return data;
    },
  });
  
  // Create certificate mutation
  const createCertificateMutation = useMutation({
    mutationFn: async (values: Omit<Certificate, "id">) => {
      const { data, error } = await supabase
        .from("certificates")
        .insert([values])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Certificate created",
        description: "The certificate was created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating certificate",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update certificate mutation
  const updateCertificateMutation = useMutation({
    mutationFn: async (values: Partial<Certificate> & { id: string }) => {
      const { id, ...rest } = values;
      const { data, error } = await supabase
        .from("certificates")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      setEditingCertificate(null);
      form.reset();
      toast({
        title: "Certificate updated",
        description: "The certificate was updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating certificate",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete certificate mutation
  const deleteCertificateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      toast({
        title: "Certificate deleted",
        description: "The certificate was deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting certificate",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: Omit<Certificate, "id">) => {
    if (editingCertificate) {
      updateCertificateMutation.mutate({ id: editingCertificate.id, ...values });
    } else {
      createCertificateMutation.mutate(values);
    }
  };
  
  // Open edit modal
  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    form.reset({
      title: certificate.title,
      event: certificate.event,
      issue_date: certificate.issue_date,
      type: certificate.type,
      image_url: certificate.image_url || "",
      user_id: certificate.user_id,
    });
    setIsCreateModalOpen(true);
  };
  
  // Open create modal
  const handleCreate = () => {
    setEditingCertificate(null);
    form.reset({
      title: "",
      event: "",
      issue_date: new Date().toISOString().split("T")[0],
      type: "Achievement",
      image_url: "",
      user_id: "",
    });
    setIsCreateModalOpen(true);
  };
  
  // Filter certificates by search
  const filteredCertificates = certificates.filter((certificate) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      certificate.title.toLowerCase().includes(searchLower) ||
      certificate.event.toLowerCase().includes(searchLower) ||
      certificate.type.toLowerCase().includes(searchLower) ||
      (certificate.user?.full_name && certificate.user.full_name.toLowerCase().includes(searchLower)) ||
      (certificate.user?.username && certificate.user.username.toLowerCase().includes(searchLower)) ||
      (certificate.user?.email && certificate.user.email.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Certificates Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-campus-neutral-500 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search certificates..."
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
              Issue Certificate
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
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Title</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Event</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Type</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Issued To</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Issue Date</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.length > 0 ? (
                  filteredCertificates.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{certificate.title}</td>
                      <td className="py-3 px-4 border-b">{certificate.event}</td>
                      <td className="py-3 px-4 border-b">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-campus-blue-light text-campus-blue">
                          {certificate.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                          <span>{certificate.user?.full_name || certificate.user?.username || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        {new Date(certificate.issue_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex gap-2">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            iconLeft={<Edit className="h-4 w-4" />}
                            onClick={() => handleEdit(certificate)}
                          >
                            Edit
                          </CustomButton>
                          
                          <CustomButton
                            variant="outline"
                            size="sm"
                            iconLeft={<Trash className="h-4 w-4" />}
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this certificate?")) {
                                deleteCertificateMutation.mutate(certificate.id);
                              }
                            }}
                          >
                            Delete
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-campus-neutral-500">
                      No certificates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCertificate ? "Edit Certificate" : "Issue New Certificate"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue To <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register("user_id", { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username || user.id}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate Title <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("title", { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g. First Place Award"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("event", { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g. Basketball Tournament 2023"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register("type", { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Achievement">Achievement</option>
                <option value="Recognition">Recognition</option>
                <option value="Participation">Participation</option>
                <option value="Award">Award</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...form.register("issue_date", { required: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                {...form.register("image_url")}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com/certificate-image.jpg"
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
                isLoading={createCertificateMutation.isPending || updateCertificateMutation.isPending}
              >
                {editingCertificate ? "Update Certificate" : "Issue Certificate"}
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCertificates;
