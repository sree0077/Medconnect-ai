export interface SystemSettings {
  // General Settings
  platformName: string;
  supportEmail: string;
  timezone: string;
  maintenanceMode: boolean;
  
  // Security Settings
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordPolicy: 'basic' | 'strong' | 'strict';
  loginAttempts: number;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  systemAlerts: boolean;
  doctorApprovalNotifs: boolean;
  
  // AI Settings
  aiResponseTime: number;
  confidenceThreshold: number;
  autoLearnEnabled: boolean;
  debugMode: boolean;
}
