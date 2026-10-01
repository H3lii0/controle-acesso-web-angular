import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import { SchoolSettings, SchoolSettingsPayload } from './settings.models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  readonly schoolName = signal('Escola Modelo');

  school(): Observable<{ data: SchoolSettings }> {
    return this.http.get<{ data: SchoolSettings }>(`${API_BASE_URL}/admin/settings/school`).pipe(
      tap((response) => this.schoolName.set(response.data.name)),
    );
  }

  updateSchool(payload: SchoolSettingsPayload): Observable<{ data: SchoolSettings; message: string }> {
    return this.http.put<{ data: SchoolSettings; message: string }>(`${API_BASE_URL}/admin/settings/school`, payload).pipe(
      tap((response) => this.schoolName.set(response.data.name)),
    );
  }
}
