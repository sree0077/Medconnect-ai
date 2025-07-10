import { useEffect, useState } from "react";
import axios from "axios";
import { SkeletonDashboard } from "../../shared/components/skeleton";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin?: string;
}

interface AdminData {
  users: User[];
  statistics: {
    totalUsers: number;
    totalPatients: number;
    totalDoctors: number;
    activeUsers: number;
    pendingUsers: number;
    newUsersThisWeek: number;
  };
  systemStats: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    averageAppointmentsPerDay: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.response?.data?.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleUserStatusChange = async (userId: string, newStatus: User["status"]) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh dashboard data
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating user status");
    }
  };

  if (loading) {
    return <SkeletonDashboard type="admin" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        No dashboard data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        
        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-semibold text-gray-900">{data.statistics.totalUsers}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>Patients: {data.statistics.totalPatients}</p>
              <p>Doctors: {data.statistics.totalDoctors}</p>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">User Status</h3>
            <p className="text-2xl font-semibold text-gray-900">{data.statistics.activeUsers} Active</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>{data.statistics.pendingUsers} Pending</p>
              <p>{data.statistics.newUsersThisWeek} New this week</p>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Appointment Stats</h3>
            <p className="text-2xl font-semibold text-gray-900">{data.systemStats.totalAppointments}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>{data.systemStats.completedAppointments} Completed</p>
              <p>{data.systemStats.cancelledAppointments} Cancelled</p>
              <p>Avg: {data.systemStats.averageAppointmentsPerDay}/day</p>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.users && data.users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "doctor"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.status && user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.status}
                        onChange={(e) => handleUserStatusChange(user._id, e.target.value as User["status"])}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 