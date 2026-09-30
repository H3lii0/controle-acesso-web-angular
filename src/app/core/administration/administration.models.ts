export type EmployeeStatus = 'pending_activation' | 'active' | 'disabled';

export interface Permission {
  key: string;
  name: string;
  description: string | null;
  category: string;
}

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  account_type: 'employee';
  account_status: EmployeeStatus;
  email_verified_at: string | null;
  created_at: string | null;
  permissions: Permission[];
}

export interface PaginatedResponse<T> {
  data: T[];
  links: Record<string, unknown>;
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus | '';
  page?: number;
  per_page?: number;
}

export interface EmployeePayload {
  full_name: string;
  email: string;
  phone: string | null;
  permissions: string[];
}
