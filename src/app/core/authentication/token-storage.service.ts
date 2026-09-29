import { Injectable } from '@angular/core';
import { AuthSession } from './auth.models';

const SESSION_STORAGE_KEY = 'school_access_control_session';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getSession(): AuthSession | null {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      this.clear();
      return null;
    }
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  save(session: AuthSession): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}


