import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ProjectMediaRequest, ProjectMediaResponse} from '../_models/project-media';

@Injectable({
  providedIn: 'root'
})
export class ProjectMediaService {
  private apiUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) { }

  createProjectMedia(projectId: number, request: ProjectMediaRequest): Observable<ProjectMediaResponse> {
    return this.http.post<ProjectMediaResponse>(
      `${this.apiUrl}/${projectId}/media`,
      request
    );
  }

  getAllMediaByProjectId(projectId: number): Observable<ProjectMediaResponse[]> {
    return this.http.get<ProjectMediaResponse[]>(
      `${this.apiUrl}/${projectId}/media`
    );
  }

  getProjectMediaById(projectId: number, mediaId: number): Observable<ProjectMediaResponse> {
    return this.http.get<ProjectMediaResponse>(
      `${this.apiUrl}/${projectId}/media/${mediaId}`
    );
  }

  updateProjectMedia(
    projectId: number,
    mediaId: number,
    request: ProjectMediaRequest
  ): Observable<ProjectMediaResponse> {
    return this.http.put<ProjectMediaResponse>(
      `${this.apiUrl}/${projectId}/media/${mediaId}`,
      request
    );
  }

  deleteProjectMedia(projectId: number, mediaId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${projectId}/media/${mediaId}`
    );
  }
}
