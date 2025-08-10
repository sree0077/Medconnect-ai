import { useState, useEffect, useCallback } from 'react';
import { usageService } from '../services/api';

interface UsageData {
  subscriptionTier: string;
  currentUsage: {
    aiMessages: number;
    appointments: number;
  };
  limits: {
    aiMessages: number;
    appointmentsPerMonth: number;
  };
  usagePercentage: {
    aiMessages: number;
    appointments: number;
  };
  hasUnlimitedUsage: boolean;
  needsUpgrade: boolean;
}

interface UsageCheckResult {
  allowed: boolean;
  reason: string;
  current?: number;
  limit?: number;
  remaining?: number;
}

export const useUsageTracking = () => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load usage data
  const loadUsageData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usageService.getUsageSummary();
      setUsageData(data);
    } catch (err: any) {
      console.error('Error loading usage data:', err);
      setError(err.response?.data?.message || 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user can perform a specific action
  const checkActionLimit = useCallback(async (action: 'aiMessage' | 'appointment'): Promise<UsageCheckResult> => {
    try {
      const result = await usageService.checkActionLimit(action);
      return result;
    } catch (err: any) {
      console.error('Error checking action limit:', err);
      return {
        allowed: false,
        reason: 'error',
      };
    }
  }, []);

  // Refresh usage data after an action
  const refreshUsage = useCallback(() => {
    loadUsageData();
  }, [loadUsageData]);

  // Check if user has unlimited usage
  const hasUnlimitedUsage = usageData?.hasUnlimitedUsage || false;

  // Check if user needs upgrade
  const needsUpgrade = usageData?.needsUpgrade || false;

  // Get remaining usage for a specific feature
  const getRemainingUsage = useCallback((feature: 'aiMessages' | 'appointments') => {
    if (!usageData) return 0;
    if (hasUnlimitedUsage) return -1; // Unlimited
    
    const current = usageData.currentUsage[feature];
    const limit = feature === 'aiMessages' 
      ? usageData.limits.aiMessages 
      : usageData.limits.appointmentsPerMonth;
    
    return Math.max(0, limit - current);
  }, [usageData, hasUnlimitedUsage]);

  // Get usage percentage for a specific feature
  const getUsagePercentage = useCallback((feature: 'aiMessages' | 'appointments') => {
    if (!usageData || hasUnlimitedUsage) return 0;
    return usageData.usagePercentage[feature];
  }, [usageData, hasUnlimitedUsage]);

  // Check if a feature is at limit
  const isAtLimit = useCallback((feature: 'aiMessages' | 'appointments') => {
    if (!usageData || hasUnlimitedUsage) return false;
    
    const current = usageData.currentUsage[feature];
    const limit = feature === 'aiMessages' 
      ? usageData.limits.aiMessages 
      : usageData.limits.appointmentsPerMonth;
    
    return current >= limit;
  }, [usageData, hasUnlimitedUsage]);

  // Get subscription tier
  const subscriptionTier = usageData?.subscriptionTier || 'free';

  // Load data on mount
  useEffect(() => {
    loadUsageData();
  }, [loadUsageData]);

  return {
    // Data
    usageData,
    loading,
    error,
    
    // Computed values
    hasUnlimitedUsage,
    needsUpgrade,
    subscriptionTier,
    
    // Functions
    loadUsageData,
    refreshUsage,
    checkActionLimit,
    getRemainingUsage,
    getUsagePercentage,
    isAtLimit,
  };
};

// Hook for checking specific action limits with modal support
export const useActionLimitCheck = () => {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalData, setLimitModalData] = useState<{
    limitType: 'aiMessage' | 'appointment';
    currentUsage: {
      current: number;
      limit: number;
      remaining: number;
    };
  } | null>(null);

  const checkAndExecuteAction = useCallback(async (
    action: 'aiMessage' | 'appointment',
    callback: () => void | Promise<void>
  ) => {
    try {
      const result = await usageService.checkActionLimit(action);
      
      if (result.allowed) {
        // User can perform the action
        await callback();
      } else {
        // User has hit the limit, show modal
        setLimitModalData({
          limitType: action,
          currentUsage: {
            current: result.current || 0,
            limit: result.limit || 0,
            remaining: result.remaining || 0,
          },
        });
        setShowLimitModal(true);
      }
    } catch (error) {
      console.error('Error checking action limit:', error);
      // On error, allow the action to proceed (fail open)
      await callback();
    }
  }, []);

  const closeLimitModal = useCallback(() => {
    setShowLimitModal(false);
    setLimitModalData(null);
  }, []);

  return {
    showLimitModal,
    limitModalData,
    checkAndExecuteAction,
    closeLimitModal,
  };
};

export default useUsageTracking;
