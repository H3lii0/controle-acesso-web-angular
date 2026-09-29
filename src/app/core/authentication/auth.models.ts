export interface School {
  id: number;
  name: string;
  slug: string;
  status?: string;
  is_owner?: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  type: string;
  status: string;
  current_school?: School | null;
  schools?: School[];
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  currentSchool: School | null;
  schools: School[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type?: string;
  user: AuthUser;
  current_school?: School | null;
  schools?: School[];
}

export type CurrentUserResponse = AuthUser;

export interface ApiResponse<T> {
  data: T;
}


