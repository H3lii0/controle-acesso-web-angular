import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const terminalGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.initialize().pipe(
    map((session) => {
      const user = session?.user;
      const canUseTerminal = user?.account_type === 'central_administrator'
        || (user?.account_type === 'employee' && user.permissions.includes('access_records.create'));

      return canUseTerminal ? true : router.parseUrl('/login');
    }),
  );
};
