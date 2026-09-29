import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from './token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(TokenStorageService).getToken();

  const authenticatedRequest = request.clone({
    setHeaders: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return next(authenticatedRequest);
};


