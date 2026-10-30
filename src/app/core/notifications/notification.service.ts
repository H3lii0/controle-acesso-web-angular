import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import { PaginatedPortalNotifications } from './notification.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/guardian/notifications`;

  list(perPage = 50): Observable<PaginatedPortalNotifications> {
    const params = new HttpParams().set('per_page', perPage);
    return this.http.get<PaginatedPortalNotifications>(this.endpoint, { params });
  }

  markAsRead(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.endpoint}/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.endpoint}/read-all`, {});
  }
}
