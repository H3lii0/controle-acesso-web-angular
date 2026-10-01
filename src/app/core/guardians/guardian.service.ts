import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../configuration/api.config';
import { Guardian, GuardianPayload, PaginatedGuardians } from './guardian.models';

@Injectable({ providedIn: 'root' })
export class GuardianService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/guardians`;

  list(search = '', page = 1): Observable<PaginatedGuardians> {
    let params = new HttpParams().set('page', page).set('per_page', 15);
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<PaginatedGuardians>(this.endpoint, { params });
  }

  create(payload: GuardianPayload): Observable<{ data: Guardian; message: string }> {
    return this.http.post<{ data: Guardian; message: string }>(this.endpoint, payload);
  }

  show(id: number): Observable<{ data: Guardian }> {
    return this.http.get<{ data: Guardian }>(`${this.endpoint}/${id}`);
  }

  update(id: number, payload: GuardianPayload): Observable<{ data: Guardian; message: string }> {
    return this.http.put<{ data: Guardian; message: string }>(`${this.endpoint}/${id}`, payload);
  }

  resendInvitation(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.endpoint}/${id}/resend-invitation`, {});
  }

}
