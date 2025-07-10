import { User } from './auth';

export interface Prescription {
  _id: string;
  patientId: string | User;
  doctorId: string | User;
  diagnosis: string;
  medicines: string[];
  advice?: string;
  createdAt: string;
  updatedAt: string;
}
