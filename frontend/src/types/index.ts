export interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  courseType: 'UG' | 'PG';
  duration: string;
  eligibility: string;
  fees: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
}

export interface Department {
  id: number;
  name: string;
  slug: string;
  description: string;
  hodId: number;
}

export interface Faculty {
  id: number;
  departmentId: number;
  name: string;
  photo: string;
  qualification: string;
  experience: string;
  email: string;
  phone: string;
  bio: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role: string;
  status: 'active' | 'inactive' | 'blocked';
  permissions?: any;
}

export interface Inquiry {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  courseId: number;
  specializationId: number;
  city: string;
  message: string;
  source: string;
  status: string;
  assignedTo: number;
  followupDate: string;
  notes: string;
  createdAt: string;
}
