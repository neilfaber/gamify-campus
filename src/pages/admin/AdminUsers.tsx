
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/layouts/AdminLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Search, User, Mail, Calendar } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  user_email: string | null;
  created_at: string | null;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, 
          full_name, 
          username, 
          avatar_url, 
          created_at,
          user_email:id(email)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });
  
  // Filter users by search
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.user_email && user.user_email.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Users Management</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-campus-neutral-500 h-4 w-4" />
            <input 
              type="text"
              placeholder="Search users..."
              className="pl-9 py-2 pr-4 border rounded-md w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">User</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Email</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Username</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Joined</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-campus-blue-light text-campus-blue flex items-center justify-center mr-3 text-sm font-bold">
                            {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                          </div>
                          <span>{user.full_name || 'Anonymous User'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                          <span>{user.user_email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                          <span>{user.username || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1.5 text-campus-neutral-400" />
                          <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <CustomButton
                          variant="outline"
                          size="sm"
                          onClick={() => alert('This would show user details')}
                        >
                          View Details
                        </CustomButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-campus-neutral-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
