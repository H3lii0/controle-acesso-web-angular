import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { firstValueFrom, forkJoin, isObservable, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../configuration/api.config';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';
import { AuthUser } from './auth.models';
import { guardianGuard } from './guardian.guard';

describe('Session restoration', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function runGuards(roleGuard: CanActivateFn, url: string) {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    const results = TestBed.runInInjectionContext(() => [
      authGuard(route, state),
      roleGuard(route, state),
    ]);
    return firstValueFrom(
      forkJoin(results.map((result) => (isObservable(result) ? result : of(result)))),
    );
  }

  function respondAs(accountType: AuthUser['account_type']): void {
    const user: AuthUser = {
      id: 1,
      full_name: 'Test User',
      email: 'user@example.test',
      phone: null,
      account_type: accountType,
      account_status: 'active',
      permissions: [],
    };
    http.expectOne(`${API_BASE_URL}/auth/me`).flush({ data: user });
  }

  it('restores an administrator session before evaluating the administration guard', async () => {
    const result = runGuards(adminGuard, '/admin/school-classes');
    respondAs('central_administrator');
    expect(await result).toEqual([true, true]);
  });

  it('restores a guardian session before evaluating the guardian guard', async () => {
    const result = runGuards(guardianGuard, '/guardian');
    respondAs('guardian');
    expect(await result).toEqual([true, true]);
  });

  it('continues to refuse administration access to an employee after restoring the session', async () => {
    const result = runGuards(adminGuard, '/admin/school-classes');
    respondAs('employee');
    const [authenticated, authorized] = await result;
    expect(authenticated).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(authorized as UrlTree)).toBe('/login');
  });
});
