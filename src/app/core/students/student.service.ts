import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import {
  PaginatedAccessRecords,
  PaginatedGuardians,
  PaginatedStudents,
  GuardianStudent,
  SchoolClass,
  Student,
  StudentAccessRecord,
  StudentFilters,
  StudentPayload,
} from './student.models';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);

  list(filters: StudentFilters = {}): Observable<PaginatedStudents> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.school_class_id) params = params.set('school_class_id', filters.school_class_id);
    if (filters.is_active !== undefined) params = params.set('is_active', filters.is_active);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.per_page) params = params.set('per_page', filters.per_page);
    return this.http.get<PaginatedStudents>(`${API_BASE_URL}/students`, { params });
  }

  show(id: number): Observable<{ data: Student }> {
    return this.http.get<{ data: Student }>(`${API_BASE_URL}/students/${id}`);
  }

  schoolClassOptions(): Observable<{ data: SchoolClass[] }> {
    return this.http.get<{ data: SchoolClass[] }>(`${API_BASE_URL}/school-classes/options`);
  }

  searchGuardians(search: string): Observable<PaginatedGuardians> {
    const params = new HttpParams().set('search', search).set('per_page', 10);
    return this.http.get<PaginatedGuardians>(`${API_BASE_URL}/guardians`, { params });
  }

  create(payload: StudentPayload): Observable<{ data: Student; message: string }> {
    return this.http.post<{ data: Student; message: string }>(`${API_BASE_URL}/students`, payload);
  }

  update(id: number, payload: StudentPayload): Observable<{ data: Student; message?: string }> {
    return this.http.put<{ data: Student; message?: string }>(
      `${API_BASE_URL}/students/${id}`,
      payload,
    );
  }

  updateStatus(id: number, isActive: boolean): Observable<{ data: Student; message?: string }> {
    return this.http.patch<{ data: Student; message?: string }>(
      `${API_BASE_URL}/students/${id}/status`,
      { is_active: isActive },
    );
  }

  captureBiometric(id: number): Observable<{ data: Student; message: string }> {
    return this.http.post<{ data: Student; message: string }>(
      `${API_BASE_URL}/students/${id}/biometric`,
      {},
    );
  }

  readAccess(
    identifier: string,
  ): Observable<{
    code: string;
    message: string;
    retry_after_seconds: number | null;
    data: StudentAccessRecord;
  }> {
    return this.http.post<{
      code: string;
      message: string;
      retry_after_seconds: number | null;
      data: StudentAccessRecord;
    }>(`${API_BASE_URL}/access-records/read`, { credential_identifier: identifier });
  }

  accessRecords(date: string, search: string): Observable<PaginatedAccessRecords> {
    const params = new HttpParams().set('date', date).set('search', search).set('per_page', 100);
    return this.http.get<PaginatedAccessRecords>(`${API_BASE_URL}/access-records`, { params });
  }

  guardianStudents(): Observable<{ data: GuardianStudent[] }> {
    return this.http.get<{ data: GuardianStudent[] }>(`${API_BASE_URL}/guardian/students`);
  }

  guardianAccessRecords(
    studentId: number,
    dateFrom: string,
    dateTo: string,
  ): Observable<PaginatedAccessRecords> {
    const params = new HttpParams()
      .set('date_from', dateFrom)
      .set('date_to', dateTo)
      .set('per_page', 100);

    return this.http.get<PaginatedAccessRecords>(
      `${API_BASE_URL}/guardian/students/${studentId}/access-records`,
      { params },
    );
  }
}
