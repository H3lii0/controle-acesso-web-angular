export type DashboardPeriod = 'today' | 'last_7_days';
export type DashboardShift = 'morning' | 'afternoon';

export interface DashboardFilters {
  date: string;
  period: DashboardPeriod;
  school_class_id?: number;
  shift?: DashboardShift;
}

export interface DashboardSummary {
  date: string;
  period: DashboardPeriod;
  filters: { school_class_id: number | null; shift: DashboardShift | null };
  classes: Array<{ id: number; name: string; shift: DashboardShift }>;
  students: { total: number; inside: number; without_access: number };
  accesses: { readings: number; entries: number; exits: number; inside: number };
  delays: number | null;
  denied: number | null;
  flow: Array<{ label: string; entries: number; exits: number }>;
  recent_events: Array<{
    student_id: number;
    name: string;
    enrollment: string;
    class_name: string;
    timestamp: string;
    movement: string;
    status: string;
    tone: 'success' | 'info';
  }>;
  terminals: Array<{ name: string; status: 'online'; last_sync_at: string }>;
}
