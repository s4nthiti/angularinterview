import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserCreateRequest, UserCreateResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  create(payload: UserCreateRequest): Observable<UserCreateResponse> {
    return this.http.post<UserCreateResponse>(`${this.baseUrl}/api/users`, payload);
  }
}
