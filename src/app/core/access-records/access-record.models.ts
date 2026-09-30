export type AccessRecordStatus = 'inside' | 'completed';

export interface AccessRecordStudent {
  id: number;
  enrollment_number: string;
  full_name: string;
  is_active: boolean;
  school_class: { id: number; name: string; shift: 'morning' | 'afternoon'; is_active: boolean };
}

export interface AccessRecord {
  id: number;
  access_date: string;
  status: AccessRecordStatus;
  entered_at: string;
  exited_at: string | null;
  student: AccessRecordStudent;
}

export interface AccessRecordFilters {
  date: string;
  search?: string;
  status?: AccessRecordStatus;
  page?: number;
  per_page?: number;
}

export interface PaginatedAccessRecords {
  data: AccessRecord[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface AccessRecordSummary {
  date: string;
  entries: number;
  exits: number;
  inside: number;
}

