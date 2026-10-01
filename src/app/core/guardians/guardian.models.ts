export type GuardianStatus = 'pending_activation' | 'active' | 'disabled';

export interface Guardian {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  account_status: GuardianStatus;
  email_verified_at: string | null;
  students_count: number;
  students?: GuardianStudent[];
}

export interface GuardianStudent {
  id: number;
  enrollment_number: string;
  full_name: string;
  is_active: boolean;
  school_class: { id: number; name: string; shift: 'morning' | 'afternoon' } | null;
}

export interface GuardianPayload {
  full_name: string;
  email: string;
  phone: string | null;
}

export interface PaginatedGuardians {
  data: Guardian[];
  meta: { current_page: number; last_page: number; total: number };
}
