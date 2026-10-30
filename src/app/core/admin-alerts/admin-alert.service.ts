import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import { AdminAlertResponse, AdminAlertType } from './admin-alert.models';

@Injectable({ providedIn: 'root' })
export class AdminAlertService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/admin/alerts`;

  list(type: AdminAlertType): Observable<AdminAlertResponse> {
    const params = new HttpParams().set('type', type).set('per_page', 100);
    return this.http.get<AdminAlertResponse>(this.endpoint, { params });
  }
}
