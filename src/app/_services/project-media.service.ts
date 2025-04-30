import { Injectable } from '@angular/core';
import {HttpClient, HttpEvent, HttpRequest} from '@angular/common/http';
import { Observable } from 'rxjs';
import {MediaType, ProjectMedia} from '../_models/project-media';


@Injectable({
  providedIn: 'root'
})
export class ProjectMediaService {
  private apiUrl  = 'http://localhost:8080/api/project-media'; // adapte si besoin

  constructor(private http: HttpClient) { }

  uploadMedia(projectId: number, file: File, mediaType: MediaType): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);

    const req = new HttpRequest('POST', `${this.apiUrl}/${projectId}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getProjectMedia(projectId: number): Observable<ProjectMedia[]> {
    return this.http.get<ProjectMedia[]>(`${this.apiUrl}/${projectId}`);
  }

  getProjectMediaByType(projectId: number, mediaType: MediaType): Observable<ProjectMedia[]> {
    return this.http.get<ProjectMedia[]>(`${this.apiUrl}/${projectId}/type/${mediaType}`);
  }

  downloadMedia(mediaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${mediaId}`, {
      responseType: 'blob'
    });
  }

  deleteMedia(mediaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${mediaId}`);
  }

  getMediaTypes(): Observable<MediaType[]> {
    return this.http.get<MediaType[]>(`${this.apiUrl}/media-types`);
  }
}
