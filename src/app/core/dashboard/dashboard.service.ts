import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import { DashboardFilters, DashboardSummary } from './dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  summary(filters: DashboardFilters): Observable<{ data: DashboardSummary }> {
    let params = new HttpParams().set('date', filters.date).set('period', filters.period);
    if (filters.school_class_id) params = params.set('school_class_id', filters.school_class_id);
    if (filters.shift) params = params.set('shift', filters.shift);
    return this.http.get<{ data: DashboardSummary }>(`${API_BASE_URL}/dashboard/summary`, { params });
  }
}
