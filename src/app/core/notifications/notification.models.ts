export interface PortalNotificationData {
  kind: string;
  access_record_id: number;
  student_id: number;
  student_name: string;
  movement: 'entry' | 'exit';
  movement_label: string;
  title: string;
  message: string;
  occurred_at: string | null;
}

export interface PortalNotification {
  id: string;
  type: string;
  data: PortalNotificationData;
  read_at: string | null;
  created_at: string | null;
}

export interface PaginatedPortalNotifications {
  data: PortalNotification[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    unread_count: number;
  };
}
