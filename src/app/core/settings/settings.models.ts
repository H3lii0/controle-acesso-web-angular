export interface SchoolSettings {
  id: number;
  name: string;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
}

export interface SchoolSettingsPayload {
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  timezone: string;
}

export interface ProfilePayload {
  full_name: string;
  phone: string;
}
