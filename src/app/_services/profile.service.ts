import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ProfileUpdateRequest} from '../_models/profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api/profiles'; // Fixed URL to match your backend

  constructor(private http: HttpClient) { }

  getProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: number, profileUpdateRequest: ProfileUpdateRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, profileUpdateRequest);
  }

  uploadProfilePicture(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${userId}/picture`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
