
import { Link } from "react-router-dom";
import { Users, Calendar, Award, Users as UsersIcon, BarChart } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  // Fetch counts for dashboard
  const { data: counts, isLoading } = useQuery({
    queryKey: ["admin-dashboard-counts"],
    queryFn: async () => {
      const [
        eventsRes, 
        usersRes, 
        teamsRes,
        certificatesRes
      ] = await Promise.all([
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("teams").select("id", { count: "exact" }),
        supabase.from("certificates").select("id", { count: "exact" }),
      ]);
      
      return {
        events: eventsRes.count || 0,
        users: usersRes.count || 0,
        teams: teamsRes.count || 0,
        certificates: certificatesRes.count || 0
      };
    },
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 h-32">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/admin/events"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-campus-neutral-600">Events</h2>
                <Calendar className="h-5 w-5 text-campus-blue" />
              </div>
              <p className="text-3xl font-bold mb-1">{counts?.events || 0}</p>
              <p className="text-sm text-campus-neutral-500">Total events</p>
            </Link>
            
            <Link 
              to="/admin/teams"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-campus-neutral-600">Teams</h2>
                <Users className="h-5 w-5 text-campus-blue" />
              </div>
              <p className="text-3xl font-bold mb-1">{counts?.teams || 0}</p>
              <p className="text-sm text-campus-neutral-500">Active teams</p>
            </Link>
            
            <Link 
              to="/admin/certificates"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-campus-neutral-600">Certificates</h2>
                <Award className="h-5 w-5 text-campus-blue" />
              </div>
              <p className="text-3xl font-bold mb-1">{counts?.certificates || 0}</p>
              <p className="text-sm text-campus-neutral-500">Issued certificates</p>
            </Link>
            
            <Link 
              to="/admin/users"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-campus-neutral-600">Users</h2>
                <UsersIcon className="h-5 w-5 text-campus-blue" />
              </div>
              <p className="text-3xl font-bold mb-1">{counts?.users || 0}</p>
              <p className="text-sm text-campus-neutral-500">Registered users</p>
            </Link>
          </div>
        )}
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <BarChart className="h-5 w-5 text-campus-blue" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Event</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">User</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Type</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-medium text-campus-neutral-500">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b">Basketball Tournament</td>
                  <td className="py-2 px-4 border-b">John Smith</td>
                  <td className="py-2 px-4 border-b">Registration</td>
                  <td className="py-2 px-4 border-b">2023-05-15</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Football Match</td>
                  <td className="py-2 px-4 border-b">Alice Johnson</td>
                  <td className="py-2 px-4 border-b">Registration</td>
                  <td className="py-2 px-4 border-b">2023-05-14</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Tennis Singles</td>
                  <td className="py-2 px-4 border-b">Robert Brown</td>
                  <td className="py-2 px-4 border-b">Certificate Issued</td>
                  <td className="py-2 px-4 border-b">2023-05-12</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
