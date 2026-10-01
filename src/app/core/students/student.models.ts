import { SchoolClass } from '../school-classes/school-class.models';

export type { SchoolClass } from '../school-classes/school-class.models';
export type StudentStatusFilter = '' | 'active' | 'inactive';

export interface GuardianSummary {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  account_status: 'pending_activation' | 'active' | 'disabled';
  students_count?: number;
}

export interface StudentPayload {
  student: {
    enrollment_number: string;
    full_name: string;
    date_of_birth: string;
    school_class_id: number;
    biometric_captured?: boolean;
  };
  guardian: {
    mode: 'new' | 'existing';
    id?: number;
    full_name?: string;
    email?: string;
    phone?: string | null;
  };
}

export interface StudentAccessRecord {
  id: number;
  access_date: string;
  status: 'inside' | 'completed';
  entered_at: string;
  exited_at: string | null;
  student: { id: number; enrollment_number: string; full_name: string; is_active: boolean; school_class: SchoolClass };
}

export interface GuardianStudent {
  id: number;
  enrollment_number: string;
  full_name: string;
  date_of_birth: string;
  is_active: boolean;
  school_class: SchoolClass;
}

export interface PaginatedAccessRecords {
  data: StudentAccessRecord[];
  meta: { current_page: number; last_page: number; total: number };
}

export interface PaginatedGuardians {
  data: GuardianSummary[];
  links: Record<string, unknown>;
  meta: { current_page: number; last_page: number; total: number };
}

export interface Student {
  id: number;
  enrollment_number: string;
  full_name: string;
  date_of_birth: string;
  is_active: boolean;
  school_class: SchoolClass;
  guardian: GuardianSummary;
  biometric: { captured: boolean; identifier?: string };
}

export interface StudentFilters {
  search?: string;
  school_class_id?: number;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface PaginatedStudents {
  data: Student[];
  links: Record<string, unknown>;
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}
