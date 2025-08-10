import React, { useState, useEffect } from 'react';
import { AdminDataTable } from '../components/AdminDataTable';
import { 
  Users, 
  Crown, 
  Zap, 
  Building, 
  Edit3, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  History,
  UserCheck
} from 'lucide-react';
import { adminPlanService } from '../../shared/services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  subscription: {
    tier: string;
    status: string;
    startDate: string;
    lastPaymentDate?: string;
  };
  createdAt: string;
  status: string;
}

interface PlanChangeLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  fromTier: string;
  toTier: string;
  changedBy: string;
  reason: string;
  timestamp: string;
  type: 'manual' | 'payment' | 'system';
}

const AdminUserPlanManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [planChangeLogs, setPlanChangeLogs] = useState<PlanChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  useEffect(() => {
    loadUsers();
    loadPlanChangeLogs();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterTier]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminPlanService.getUsersWithSubscriptions({
        search: searchTerm,
        tier: filterTier === 'all' ? undefined : filterTier
      });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanChangeLogs = async () => {
    try {
      const data = await adminPlanService.getPlanChangeLogs();
      setPlanChangeLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading plan change logs:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTier !== 'all') {
      filtered = filtered.filter(user => user.subscription?.tier === filterTier);
    }

    setFilteredUsers(filtered);
  };

  const handlePlanChange = async () => {
    if (!selectedUser || !newPlan || !changeReason.trim()) return;

    try {
      setActionLoading(true);

      await adminPlanService.changeUserPlan(
        selectedUser._id,
        newPlan,
        changeReason
      );

      await loadUsers();
      await loadPlanChangeLogs();
      setShowPlanModal(false);
      setSelectedUser(null);
      setNewPlan('');
      setChangeReason('');
    } catch (error: any) {
      console.error('Error changing plan:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to change plan'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return Crown;
      case 'pro': return Zap;
      case 'clinic': return Building;
      default: return Users;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'text-gray-600 bg-gray-100';
      case 'pro': return 'text-purple-600 bg-purple-100';
      case 'clinic': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const userColumns = [
    {
      key: 'name',
      label: 'User',
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'subscription',
      label: 'Current Plan',
      render: (user: User) => {
        const tier = user.subscription?.tier || 'free';
        const TierIcon = getTierIcon(tier);
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(tier)}`}>
            <TierIcon className="w-3 h-3 mr-1" />
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.subscription?.status === 'active' 
            ? 'text-green-800 bg-green-100' 
            : 'text-red-800 bg-red-100'
        }`}>
          {user.subscription?.status || 'inactive'}
        </span>
      ),
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      render: (user: User) => formatDate(user.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <button
          onClick={() => {
            setSelectedUser(user);
            setNewPlan(user.subscription?.tier || 'free');
            setShowPlanModal(true);
          }}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <Edit3 className="w-3 h-3 mr-1" />
          Change Plan
        </button>
      ),
    },
  ];

  const logColumns = [
    {
      key: 'user',
      label: 'User',
      render: (log: PlanChangeLog) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{log.userName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{log.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'change',
      label: 'Plan Change',
      render: (log: PlanChangeLog) => (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs ${getTierColor(log.fromTier)}`}>
            {log.fromTier}
          </span>
          <span>→</span>
          <span className={`px-2 py-1 rounded text-xs ${getTierColor(log.toTier)}`}>
            {log.toTier}
          </span>
        </div>
      ),
    },
    {
      key: 'changedBy',
      label: 'Changed By',
      render: (log: PlanChangeLog) => (
        <div>
          <div className="text-sm font-medium">{log.changedBy}</div>
          <div className={`text-xs ${
            log.type === 'manual' ? 'text-orange-600' : 
            log.type === 'payment' ? 'text-green-600' : 'text-blue-600'
          }`}>
            {log.type}
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (log: PlanChangeLog) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
          {log.reason}
        </div>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date',
      render: (log: PlanChangeLog) => formatDate(log.timestamp),
    },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Plan Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage user subscription plans and view change history
            </p>
          </div>
          
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <History className="w-4 h-4" />
            <span>{showAuditLog ? 'Hide' : 'Show'} Audit Log</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="clinic">Clinic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Users ({filteredUsers.length})
            </h2>
          </div>
          
          <AdminDataTable
            data={filteredUsers}
            columns={userColumns}
            loading={loading}
            emptyMessage="No users found"
          />
        </div>

        {/* Audit Log */}
        {showAuditLog && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Plan Change Audit Log
              </h2>
            </div>
            
            <AdminDataTable
              data={planChangeLogs}
              columns={logColumns}
              loading={false}
              emptyMessage="No plan changes recorded"
            />
          </div>
        )}

        {/* Plan Change Modal */}
        {showPlanModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Change Plan for {selectedUser.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Plan: {selectedUser.subscription?.tier || 'free'}
                    </label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="free">Free Plan</option>
                      <option value="pro">Pro Plan ($19/month)</option>
                      <option value="clinic">Clinic Plan ($99/month)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Change *
                    </label>
                    <textarea
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder="Enter reason for plan change (required for audit trail)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                    />
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Warning:</strong> This will immediately change the user's plan and access level. 
                        This action will be logged for audit purposes.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPlanModal(false);
                      setSelectedUser(null);
                      setNewPlan('');
                      setChangeReason('');
                    }}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlanChange}
                    disabled={actionLoading || !newPlan || !changeReason.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Change Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default AdminUserPlanManagement;
