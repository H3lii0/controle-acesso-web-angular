import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const administrationLandingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.initialize().pipe(
    map((session) => {
      const user = session?.user;
      if (user?.account_type === 'central_administrator' || user?.permissions.includes('dashboard.view')) {
        return true;
      }

      if (user?.permissions.includes('students.view')) return router.parseUrl('/admin/students');
      if (user?.permissions.includes('access_records.view')) return router.parseUrl('/admin/access-records');
      if (user?.permissions.includes('students.create')) return router.parseUrl('/admin/guardians');

      return router.parseUrl('/login');
    }),
  );
};
