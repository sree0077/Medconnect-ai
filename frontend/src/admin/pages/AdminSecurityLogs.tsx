import React, { useState, useEffect } from 'react';
import { AdminDataTable } from '../components/AdminDataTable';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { securityLogService } from '../../shared/services/api';
import type { SecurityLog, SecurityStats } from '../../shared/types/security';
import { AdminSkeletonStatCard, SkeletonTable, SkeletonText } from '../../shared/components/skeleton';

// Column configuration for security logs table

const columns = [
  { key: 'timestamp', header: 'Timestamp', sortable: true },
  { key: 'event', header: 'Event', sortable: true },
  { key: 'user', header: 'User', sortable: true },
  { key: 'ip', header: 'IP Address', sortable: false },
  { key: 'location', header: 'Location', sortable: false },
  { key: 'severity', header: 'Severity', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
];

export const AdminSecurityLogs: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCount: 0,
    highSeverityCount: 0,
    mediumSeverityCount: 0,
    warningCount: 0,
    infoCount: 0,
    failedLoginCount: 0,
    successfulLoginCount: 0,
    recentAlerts: [] as SecurityLog[]
  });

  // Fetch security logs
  useEffect(() => {
    const fetchSecurityLogs = async () => {
      try {
        setLoading(true);
        let data;
        
        if (selectedSeverity !== 'all') {
          data = await securityLogService.getLogsBySeverity(
            selectedSeverity as 'high' | 'medium' | 'warning' | 'info'
          );
        } else if (selectedTimeRange !== 'all') {
          data = await securityLogService.getLogsByTimeRange(selectedTimeRange);
        } else {
          data = await securityLogService.getAllLogs();
        }
        
        setSecurityLogs(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch security logs', err);
        setError('Failed to load security logs. Please try again later.');
        // Set empty array on failure
        setSecurityLogs([]);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchSecurityStats = async () => {
      try {
        const statsData = await securityLogService.getSecurityStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch security stats', err);
        // Keep using the default stats
      }
    };
    
    fetchSecurityLogs();
    fetchSecurityStats();
  }, [selectedSeverity, selectedTimeRange]);

  const getSeverityBadge = (severity: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (severity) {
      case 'high':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            High
          </span>
        );
      case 'medium':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            Medium
          </span>
        );
      case 'warning':
        return (
          <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
            <XCircle className="h-3 w-3 mr-1" />
            Warning
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Info
          </span>
        );
    }
  };

  // Use security logs directly - backend now handles data cleaning
  const filteredSecurityLogs = securityLogs;

  // Transform data for table display with simplified logic
  const transformedLogs = filteredSecurityLogs.map(log => {
    // Safely format the timestamp
    let formattedTimestamp = '';
    try {
      if (log.timestamp) {
        formattedTimestamp = format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss');
      } else {
        formattedTimestamp = 'Unknown';
      }
    } catch (error) {
      console.warn('Invalid timestamp format for log:', log._id || log.id);
      formattedTimestamp = 'Invalid date';
    }

    // Simplified status determination
    const getStatusBadge = () => {
      if (log.isActive) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Active Alert
          </span>
        );
      }

      if (log.event.includes('Alert Resolved')) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </span>
        );
      }

      if (log.event.includes('Failed')) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Normal
        </span>
      );
    };

    return {
      ...log,
      id: log._id || log.id, // Standardize ID handling
      timestamp: formattedTimestamp,
      severity: getSeverityBadge(log.severity),
      status: getStatusBadge()
    };
  });

  const actions = (row: SecurityLog & { id?: string, _id?: string }) => (
    <div className="flex items-center space-x-2">
      <button 
        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
        title="View Details"
        onClick={() => console.log('View log details', row.id || row._id)}
      >
        <Eye className="h-4 w-4" />
      </button>
      {row.isActive && (
        <button 
          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
          title="Resolve Security Alert"
          onClick={() => {
            if (window.confirm('Are you sure you want to mark this security alert as resolved? This will notify all users that the system is now safe.')) {
              setLoading(true);
              securityLogService.resolveSecurityAlert(row.id || row._id || '')
                .then(() => {
                  // Refresh data
                  return Promise.all([
                    securityLogService.getAllLogs().then(setSecurityLogs),
                    securityLogService.getSecurityStats().then(setStats)
                  ]);
                })
                .catch(err => {
                  console.error('Error resolving security alert:', err);
                  setError('Failed to resolve security alert');
                })
                .finally(() => setLoading(false));
            }
          }}
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const exportLogs = () => {
    securityLogService.exportLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Security Logs</h1>
          <p className="text-gray-600 mt-2">Monitor security events and access patterns</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              setLoading(true);
              Promise.all([
                securityLogService.getAllLogs().then(setSecurityLogs),
                securityLogService.getSecurityStats().then(setStats)
              ])
                .catch(err => {
                  console.error('Error refreshing data:', err);
                  setError('Failed to refresh data. Please try again.');
                })
                .finally(() => setLoading(false));
            }}
            className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button 
            onClick={exportLogs}
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Events (24h)</p>
              {loading ? (
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCount || 0}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              {loading ? (
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.highSeverityCount || 0}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Failed Logins</p>
              {loading ? (
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.failedLoginCount || 0}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Successful Logins</p>
              {loading ? (
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.successfulLoginCount || 0}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="168h">Last Week</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                // Show dialog to confirm and enter custom message
                const customMessage = window.prompt(
                  'Send a system-wide security alert to all users? Enter a custom message or leave blank for default.',
                  'There is a security concern. Please log out of the system for your safety.'
                );

                // Only proceed if not cancelled
                if (customMessage !== null) {
                  setLoading(true);

                  // Send the security alert to all users
                  securityLogService.sendSecurityAlert(customMessage)
                    .then(() => {
                      // Refresh data
                      return Promise.all([
                        securityLogService.getAllLogs().then(setSecurityLogs),
                        securityLogService.getSecurityStats().then(setStats)
                      ]);
                    })
                    .catch(err => {
                      console.error('Error sending security alert:', err);
                      setError('Failed to send security alert to users.');
                    })
                    .finally(() => setLoading(false));
                }
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Security Alert
            </button>

            <button
              onClick={() => {
                // Show dialog to confirm and enter custom message
                const customMessage = window.prompt(
                  'Send a "Security Issue Solved" notification to all users? Enter a custom message or leave blank for default.',
                  'All security issues have been resolved. The system is now safe and secure to use.'
                );

                // Only proceed if not cancelled
                if (customMessage !== null) {
                  setLoading(true);

                  // Send the security issue solved notification to all users
                  securityLogService.sendSecurityIssueSolved(customMessage)
                    .then(() => {
                      // Refresh data
                      return Promise.all([
                        securityLogService.getAllLogs().then(setSecurityLogs),
                        securityLogService.getSecurityStats().then(setStats)
                      ]);
                    })
                    .catch(err => {
                      console.error('Error sending security issue solved notification:', err);
                      setError('Failed to send security issue solved notification to users.');
                    })
                    .finally(() => setLoading(false));
                }
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl">
              <CheckCircle className="h-4 w-4 mr-2" />
              Security Issue Solved
            </button>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Alerts</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-8 h-8 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : stats.recentAlerts && stats.recentAlerts.length > 0 ? (
            stats.recentAlerts.map((alert, index) => {
              const bgColor = alert.severity === 'high' ? 'bg-red-50 border-red-200' : 
                            alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : 
                            'bg-purple-50 border-purple-200';
              
              const textColor = alert.severity === 'high' ? 'text-red-900' : 
                              alert.severity === 'medium' ? 'text-yellow-900' : 
                              'text-purple-900';
              
              const detailColor = alert.severity === 'high' ? 'text-red-700' : 
                                alert.severity === 'medium' ? 'text-yellow-700' : 
                                'text-purple-700';
              
              const timeColor = alert.severity === 'high' ? 'text-red-600' : 
                              alert.severity === 'medium' ? 'text-yellow-600' : 
                              'text-purple-600';
              
              const Icon = alert.severity === 'high' || alert.severity === 'medium' ? 
                          AlertTriangle : CheckCircle;
              
              const iconColor = alert.severity === 'high' ? 'text-red-600' : 
                              alert.severity === 'medium' ? 'text-yellow-600' : 
                              'text-purple-600';

              // Format timestamp to "X min/hour(s) ago"
              const timestamp = new Date(alert.timestamp);
              const now = new Date();
              const diffMs = now.getTime() - timestamp.getTime();
              const diffMins = Math.round(diffMs / 60000);
              const timeAgo = diffMins < 60 
                ? `${diffMins} min ago` 
                : `${Math.round(diffMins / 60)} hour${Math.round(diffMins / 60) > 1 ? 's' : ''} ago`;
              
              return (
                <div key={index} className={`flex items-center p-3 ${bgColor} rounded-lg border`}>
                  <Icon className={`h-5 w-5 ${iconColor} mr-3 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${textColor}`}>{alert.event}</p>
                    <p className={`text-xs ${detailColor}`}>{alert.details}</p>
                  </div>
                  <span className={`text-xs ${timeColor}`}>{timeAgo}</span>
                </div>
              );
            })
          ) : (
            <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">No Recent Alerts</p>
                <p className="text-xs text-purple-700">System is operating normally</p>
              </div>
              <span className="text-xs text-purple-600">Now</span>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <SkeletonText variant="h1" width="300px" className="mb-2" />
            <SkeletonText variant="body" width="400px" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <AdminSkeletonStatCard key={`stat-${index}`} />
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SkeletonText variant="body" width="100%" height="40px" />
              <SkeletonText variant="body" width="100%" height="40px" />
              <SkeletonText variant="body" width="100%" height="40px" />
            </div>
          </div>

          {/* Data Table */}
          <SkeletonTable
            rows={10}
            columns={7}
            withHeader={true}
            withActions={true}
            columnWidths={['1.5fr', '2fr', '1.5fr', '1fr', '1.5fr', '1fr', '1fr', '150px']}
          />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-4" />
            <div>
              <h3 className="font-medium text-red-800">Error loading security logs</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  securityLogService.getAllLogs()
                    .then(data => {
                      setSecurityLogs(data);
                      setError(null);
                    })
                    .catch(err => {
                      console.error('Failed to fetch security logs on retry', err);
                      setError('Connection to server failed. Please check your network connection.');
                    })
                    .finally(() => setLoading(false));
                }}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : securityLogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-800">No Security Logs Found</h3>
          <p className="mt-2 text-gray-600">Security logs will appear here as users interact with the system.</p>
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={transformedLogs}
          actions={actions}
          searchable={true}
          filterable={false}
          pagination={true}
        />
      )}
    </div>
  );
};