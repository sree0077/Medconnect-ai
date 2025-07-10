export interface User {
  _id: string;  // Using _id because that's what MongoDB returns
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  createdAt?: string;  // For join date
  phone?: string;
  address?: string;
  specialization?: string;
  experience?: number;
  qualifications?: string[];
  lastLogin?: string;  // This may need to be tracked separately if not in the database
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  name: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
} 