import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import {
  PaginatedSchoolClasses,
  SchoolClass,
  SchoolClassFilters,
  SchoolClassPayload,
} from './school-class.models';

@Injectable({ providedIn: 'root' })
export class SchoolClassService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/admin/school-classes`;

  list(filters: SchoolClassFilters): Observable<PaginatedSchoolClasses> {
    let params = new HttpParams().set('page', filters.page ?? 1).set('per_page', filters.per_page ?? 15);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.shift) params = params.set('shift', filters.shift);
    if (filters.is_active !== undefined) params = params.set('is_active', filters.is_active ? '1' : '0');

    return this.http.get<PaginatedSchoolClasses>(this.url, { params });
  }

  create(payload: SchoolClassPayload): Observable<{ data: SchoolClass; message: string }> {
    return this.http.post<{ data: SchoolClass; message: string }>(this.url, payload);
  }

  update(id: number, payload: SchoolClassPayload,): Observable<{ data: SchoolClass; message: string }> {
    return this.http.put<{ data: SchoolClass; message: string }>(`${this.url}/${id}`, payload);
  }

  updateStatus(id: number, isActive: boolean): Observable<{ data: SchoolClass; message: string }> {
    return this.http.patch<{ data: SchoolClass; message: string }>(`${this.url}/${id}/status`, { is_active: isActive, });
  }
}
