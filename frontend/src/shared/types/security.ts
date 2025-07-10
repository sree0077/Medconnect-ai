export interface SecurityLog {
  id?: string;
  _id?: string;
  timestamp: string | Date;
  event: string;
  user: string;
  ip: string;
  location?: string;
  severity: 'high' | 'medium' | 'warning' | 'info';
  details?: string;
  isActive?: boolean;
  relatedAlertId?: string;
}

export interface SecurityStats {
  totalCount: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  warningCount: number;
  infoCount: number;
  failedLoginCount: number;
  successfulLoginCount: number;
  recentAlerts: SecurityLog[];
}
