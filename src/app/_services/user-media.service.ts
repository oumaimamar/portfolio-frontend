import { Injectable } from '@angular/core';
import {HttpClient, HttpEvent, HttpRequest} from '@angular/common/http';
import { Observable } from 'rxjs';
import {MediaType, UserMedia} from '../_models/user-media';


@Injectable({
  providedIn: 'root'
})
export class UserMediaService {
  private apiUrl  = 'http://localhost:8080/api/user-media'; // adapte si besoin

  constructor(private http: HttpClient) { }

  uploadMediaP(profileId: number, file: File, mediaType: MediaType): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);

    const req = new HttpRequest('POST', `${this.apiUrl}/${profileId}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getProjectMediaP(profileId: number): Observable<UserMedia[]> {
    return this.http.get<UserMedia[]>(`${this.apiUrl}/${profileId}`);
  }

  getProjectMediaByType(profileId: number, mediaType: MediaType): Observable<UserMedia[]> {
    return this.http.get<UserMedia[]>(`${this.apiUrl}/${profileId}/type/${mediaType}`);
  }

  downloadMediaP(mediaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${mediaId}`, {
      responseType: 'blob'
    });
  }

  deleteMediaP(mediaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${mediaId}`);
  }

  getMediaTypes(): Observable<MediaType[]> {
    return this.http.get<MediaType[]>(`${this.apiUrl}/media-types`);
  }
}
