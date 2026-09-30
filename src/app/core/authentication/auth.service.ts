import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, switchMap, tap, timeout } from 'rxjs';
import { API_BASE_URL, SANCTUM_CSRF_URL } from '../configuration/api.config';
import { ApiResponse, AuthSession, AuthUser, CurrentUserResponse, LoginCredentials } from './auth.models';
import { SessionStateService } from './session-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionState = inject(SessionStateService);
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  private initialized = false;
  private csrfRequest$: Observable<void> | null = null;

  readonly session$ = this.sessionSubject.asObservable();

  get sessionSnapshot(): AuthSession | null {
    return this.sessionSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.sessionSubject.value?.user.account_status === 'active';
  }

  initialize(): Observable<AuthSession | null> {
    if (this.initialized) {
      return of(this.sessionSnapshot);
    }

    this.initialized = true;

    return this.loadCurrentUser().pipe(
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  login(credentials: LoginCredentials): Observable<AuthSession> {
    return this.prepareCsrfCookie().pipe(
      switchMap(() => this.http.post<ApiResponse<AuthUser>>(`${API_BASE_URL}/auth/login`, credentials)),
      timeout(10000),
      map((response) => this.createSession(response.data)),
      tap((session) => this.setSession(session)),
    );
  }

  prepareCsrfCookie(): Observable<void> {
    this.csrfRequest$ ??= this.http.get<void>(SANCTUM_CSRF_URL).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.csrfRequest$;
  }

  loadCurrentUser(): Observable<AuthSession | null> {
    return this.http.get<ApiResponse<CurrentUserResponse>>(`${API_BASE_URL}/auth/me`).pipe(
      timeout(10000),
      map((response) => this.createSession(response.data)),
      tap((session) => this.setSession(session)),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.clearSession();
          return of(null);
        }

        throw error;
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/logout`, {}).pipe(
      finalize(() => this.clearSession()),
      map(() => undefined),
    );
  }

  clearSession(): void {
    this.sessionState.clear();
    this.sessionSubject.next(null);
  }

  private setSession(session: AuthSession): void {
    this.sessionState.set(session);
    this.sessionSubject.next(session);
  }

  private createSession(user: AuthUser): AuthSession {
    return { user };
  }
}
