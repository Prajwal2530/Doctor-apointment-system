export enum Role {
  Patient = 'patient',
  Doctor = 'doctor',
  Admin = 'admin',
}

export enum AppointmentStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface User {
  id: string;
  email: string;
  password?: string; // Should not be stored long-term in FE
  name: string;
  role: Role;
}

export interface Doctor extends User {
  role: Role.Doctor;
  specialization: string;
  availability: string[]; // e.g., ["09:00 AM", "10:00 AM"]
  experience: number; // in years
  fees: number; // in rupees
  gender: 'Male' | 'Female';
  languages: string[];
  consultationModes: ('Hospital Visit' | 'Online Consult')[];
  facility: string; // clinic name
  location: string;
  image: string;
}

export interface Patient extends User {
  role: Role.Patient;
}

export interface Admin extends User {
  role: Role.Admin;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
}