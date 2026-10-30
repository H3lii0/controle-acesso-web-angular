export type AdminAlertType = 'all' | 'success' | 'denied';

export interface AdminAlert {
  id: string;
  type: 'success' | 'denied';
  student_id: number | null;
  student_name: string | null;
  enrollment: string | null;
  class_name: string | null;
  title: string;
  message: string;
  occurred_at: string;
}

export interface AdminAlertResponse {
  data: AdminAlert[];
  meta: { total: number; type: AdminAlertType; days: number };
}
