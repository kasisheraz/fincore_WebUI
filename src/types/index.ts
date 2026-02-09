// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Application Types
export interface Application {
  id: number;
  applicantName: string;
  applicationId: string;
  type: string;
  amount: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  date: string;
  priority: 'Low' | 'Medium' | 'High';
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  position: string;
  employeeId: string;
  joinDate: string;
}

// Dashboard Types
export interface DashboardStats {
  totalApplications: number;
  portfolioValue: string;
  activeUsers: number;
  monthlyGrowth: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

// Report Types
export interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'Ready' | 'Processing' | 'Failed';
  downloadUrl?: string;
}

// Settings Types
export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  currency: string;
}