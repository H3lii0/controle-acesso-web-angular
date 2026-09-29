import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, map, of, tap, timeout } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import {
  ApiResponse,
  AuthUser,
  AuthSession,
  CurrentUserResponse,
  LoginCredentials,
  LoginResponse,
} from './auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(
    this.tokenStorage.getSession(),
  );

  readonly session$ = this.sessionSubject.asObservable();

  get sessionSnapshot(): AuthSession | null {
    return this.sessionSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.tokenStorage.getToken();
  }

  login(credentials: LoginCredentials): Observable<AuthSession> {
    return this.http.post<ApiResponse<LoginResponse>>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      timeout(10000),
      map((response) => response.data),
      map((data) => this.createSessionFromLogin(data.token, data)),
      tap((session) => this.setSession(session)),
    );
  }

  loadCurrentUser(): Observable<AuthSession | null> {
    const token = this.tokenStorage.getToken();

    if (!token) {
      this.clearSession();
      return of(null);
    }

    return this.http.get<ApiResponse<CurrentUserResponse>>(`${API_BASE_URL}/auth/me`).pipe(
      timeout(10000),
      map((response) => response.data),
      map((user) => this.createSessionFromUser(token, user)),
      tap((session) => this.setSession(session)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  logout(): Observable<void> {
    if (!this.tokenStorage.getToken()) {
      this.clearSession();
      return of(undefined);
    }

    return this.http.post<void>(`${API_BASE_URL}/auth/logout`, {}).pipe(
      finalize(() => {
        this.clearSession();
      }),
    );
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this.sessionSubject.next(null);
  }

  private setSession(session: AuthSession): void {
    this.tokenStorage.save(session);
    this.sessionSubject.next(session);
  }

  private createSessionFromLogin(token: string, response: LoginResponse): AuthSession {
    return this.createSessionFromUser(token, {
      ...response.user,
      current_school: response.current_school ?? response.user.current_school,
      schools: response.schools ?? response.user.schools,
    });
  }

  private createSessionFromUser(token: string, user: AuthUser): AuthSession {
    const currentSchool = user.current_school ?? null;
    const schools = user.schools ?? [];

    return {
      token,
      user: {
        ...user,
        current_school: currentSchool,
        schools,
      },
      currentSchool,
      schools,
    };
  }
}


