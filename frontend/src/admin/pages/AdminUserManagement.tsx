import React, { useState, useEffect } from 'react';
import { AdminDataTable } from '../components/AdminDataTable';
import { Eye, UserX, Trash2, Shield, User, UserCheck } from 'lucide-react';
import { userService } from '../../shared/services/api';
import { User as UserType } from '../../shared/types/auth';
import useNotifications from '../../shared/hooks/useNotifications';
import { AdminSkeletonStatCard, SkeletonTable, SkeletonText } from '../../shared/components/skeleton';
import { useSessionValidation } from '../../shared/hooks/useSessionValidation';

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'joinDate', header: 'Join Date', sortable: true },
  { key: 'phone', header: 'Phone', sortable: true },
];

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshNotifications } = useNotifications();

  // Add session validation for admin role
  const { isValidating, isSessionValid } = useSessionValidation({
    requiredRole: 'admin',
    validateOnMount: true,
    validateOnFocus: true,
  });

  // Load users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        setUsers(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(`Failed to load users: ${err.message}. Check if the backend server is running.`);
        // Fallback to empty array to avoid breaking the UI
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user status update
  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      // Update through the standard API
      await userService.updateUserStatus(userId, newStatus);

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );

      // Refresh notifications immediately to show the status change notification
      refreshNotifications();

      // Show success message
      alert(`User status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status. Please try again.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Use standard API endpoint
        await userService.deleteUser(userId);

        // Remove the user from the local state
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));

        // Refresh notifications immediately to show the deletion notification
        refreshNotifications();

        // Show success message
        alert('User deleted successfully');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const filteredData = users.filter(user => {
    // Safe access to role and status properties
    const userRole = (user.role || 'patient').toLowerCase();
    const userStatus = (user.status || 'active').toLowerCase();
    
    const roleMatch = selectedRole === 'all' || userRole === selectedRole;
    const statusMatch = selectedStatus === 'all' || userStatus === selectedStatus;
    return roleMatch && statusMatch;
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-purple-600" />;
      default: return <User className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    // Handle undefined or null status
    if (!status) {
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Active</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      default:
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Inactive</span>;
    }
  };

  // Format data for table display
  const enhancedData = filteredData.map(user => {
    // Default status to 'active' if missing
    const userStatus = user.status || 'active';
    const userRole = user.role || 'patient';
    
    return {
      ...user,
      _id: user._id, // Ensure ID is available for actions
      originalStatus: userStatus, // Store the original status for toggle functionality
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
      role: (
        <div className="flex items-center space-x-2">
          {getRoleIcon(userRole)}
          <span>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
        </div>
      ),
      status: getStatusBadge(userStatus),
    };
  });

  const actions = (row: any) => (
    <div className="flex items-center space-x-2">
      <button 
        className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
        onClick={() => window.alert(`View user details for ${row.name}`)}
      >
        <Eye className="h-4 w-4" />
      </button>
      <button 
        className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
        onClick={() => {
          // Use the originalStatus we've stored safely
          const currentStatus = (row.originalStatus || 'active').toLowerCase();
          const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
          handleStatusChange(row._id, newStatus);
        }}
      >
        <UserX className="h-4 w-4" />
      </button>
      <button 
        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
        onClick={() => {
          // Make sure _id exists before attempting to delete
          if (row._id) {
            handleDeleteUser(row._id);
          } else {
            alert('Cannot delete user: missing ID');
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <SkeletonText variant="h1" width="300px" className="mb-2" />
            <SkeletonText variant="body" width="400px" />
          </div>
          <SkeletonText variant="body" width="120px" height="40px" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdminSkeletonStatCard key={`stat-${index}`} />
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SkeletonText variant="body" width="300px" height="40px" />
            <div className="flex gap-2">
              <SkeletonText variant="body" width="100px" height="40px" />
              <SkeletonText variant="body" width="100px" height="40px" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <SkeletonTable
          rows={10}
          columns={6}
          withHeader={true}
          withActions={true}
          columnWidths={['2fr', '2fr', '1fr', '1fr', '1.5fr', '150px']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users, doctors, and administrators</p>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
          Add New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Doctors</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'doctor').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'patient').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={enhancedData}
          actions={actions}
          searchable={true}
          filterable={false}
          pagination={true}
        />
      )}
    </div>
  );
};