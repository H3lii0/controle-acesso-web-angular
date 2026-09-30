import { Injectable } from '@angular/core';
import { AuthSession } from './auth.models';

@Injectable({ providedIn: 'root' })
export class SessionStateService {
  private session: AuthSession | null = null;

  getSnapshot(): AuthSession | null {
    return this.session;
  }

  set(session: AuthSession): void {
    this.session = session;
  }

  clear(): void {
    this.session = null;
  }
}
