import { User } from './auth';

export interface Appointment {
  _id: string;
  patientId: string | User;
  doctorId: string | User;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
