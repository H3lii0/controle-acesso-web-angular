import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredPermissions = (route.data['permissions'] as string[] | undefined) ?? [];

  return auth.initialize().pipe(
    map((session) => {
      const user = session?.user;
      const allowed = user?.account_type === 'central_administrator'
        || requiredPermissions.some((permission) => user?.permissions.includes(permission));

      return allowed ? true : router.parseUrl('/admin');
    }),
  );
};
