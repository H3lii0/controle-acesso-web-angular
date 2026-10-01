export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  account_type: 'central_administrator' | 'employee' | 'guardian';
  account_status: 'pending_activation' | 'active' | 'disabled';
  permissions: string[];
}

export interface AuthSession {
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetCredentials extends PasswordResetRequest {
  token: string;
  password: string;
  password_confirmation: string;
}

export type CurrentUserResponse = AuthUser;

export interface ApiResponse<T> {
  data: T;
}


