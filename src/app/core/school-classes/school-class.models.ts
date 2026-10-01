export type SchoolShift = 'morning' | 'afternoon';

export interface SchoolClass {
  id: number;
  name: string;
  shift: SchoolShift;
  is_active: boolean;
  created_at?: string;
}

export interface SchoolClassPayload {
  name: string;
  shift: SchoolShift;
}

export interface SchoolClassFilters {
  search?: string;
  shift?: SchoolShift;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface PaginatedSchoolClasses {
  data: SchoolClass[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}
