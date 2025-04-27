import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {UserMediaRequest, UserMediaResponse} from '../_models/user-media';

@Injectable({
  providedIn: 'root'
})
export class UserMediaService {
  private apiUrl = 'http://localhost:8080/api/profiles';

  constructor(private http: HttpClient) { }

  createUserMedia(profileId: number, request: UserMediaRequest): Observable<UserMediaResponse> {
    return this.http.post<UserMediaResponse>(
      `${this.apiUrl}/${profileId}/user-media`,
      request
    );
  }

  getAllUserMedia(profileId: number): Observable<UserMediaResponse[]> {
    return this.http.get<UserMediaResponse[]>(
      `${this.apiUrl}/${profileId}/user-media`
    );
  }


  updateUserMedia(profileId: number, userMediaId: number, request: UserMediaRequest): Observable<UserMediaResponse> {
    return this.http.put<UserMediaResponse>(
      `${this.apiUrl}/${profileId}/user-media/${userMediaId}`,
      request
    );
  }

  deleteUserMedia(profileId: number, techSkillId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${profileId}/user-media/${techSkillId}`
    );
  }
}
