import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import { Employee, EmployeeFilters, EmployeePayload, PaginatedResponse, Permission } from './administration.models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/admin/employees`;

  list(filters: EmployeeFilters = {}): Observable<PaginatedResponse<Employee>> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.per_page) params = params.set('per_page', filters.per_page);

    return this.http.get<PaginatedResponse<Employee>>(this.endpoint, { params });
  }

  show(id: number): Observable<{ data: Employee }> {
    return this.http.get<{ data: Employee }>(`${this.endpoint}/${id}`);
  }

  create(payload: EmployeePayload): Observable<{ data: Employee; message: string }> {
    return this.http.post<{ data: Employee; message: string }>(this.endpoint, payload);
  }

  permissions(): Observable<{ data: Permission[] }> {
    return this.http.get<{ data: Permission[] }>(`${API_BASE_URL}/admin/permissions`);
  }
}
