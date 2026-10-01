import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.initialize().pipe(
    map((session) => session?.user.account_type === 'central_administrator'
      ? true
      : router.parseUrl('/login')),
  );
};
