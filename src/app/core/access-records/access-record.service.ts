import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import { AccessRecordFilters, AccessRecordSummary, PaginatedAccessRecords } from './access-record.models';

@Injectable({ providedIn: 'root' })
export class AccessRecordService {
  private readonly http = inject(HttpClient);

  list(filters: AccessRecordFilters): Observable<PaginatedAccessRecords> {
    let params = new HttpParams()
      .set('date', filters.date)
      .set('per_page', filters.per_page ?? 100)
      .set('page', filters.page ?? 1);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<PaginatedAccessRecords>(`${API_BASE_URL}/access-records`, { params });
  }

  summary(filters: AccessRecordFilters): Observable<{ data: AccessRecordSummary }> {
    let params = new HttpParams().set('date', filters.date);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<{ data: AccessRecordSummary }>(`${API_BASE_URL}/access-records/summary`, { params });
  }
}

