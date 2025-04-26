import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Language} from '../_models/language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private apiUrl = 'http://localhost:8080/api/profiles';

  constructor(private http: HttpClient) { }

  createLanguage(profileId: number, language: Language): Observable<Language> {
    return this.http.post<Language>(
      `${this.apiUrl}/${profileId}/languages`,
      language
    );
  }

  getLanguages(profileId: number): Observable<Language[]> {
    return this.http.get<Language[]>(
      `${this.apiUrl}/${profileId}/languages`
    );
  }

  getLanguageById(languageId: number): Observable<Language> {
    return this.http.get<Language>(
      `${this.apiUrl}/languages/${languageId}`
    );
  }

  updateLanguage(languageId: number, language: Language): Observable<Language> {
    return this.http.put<Language>(
      `${this.apiUrl}/languages/${languageId}`,
      language
    );
  }

  deleteLanguage(languageId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/languages/${languageId}`
    );
  }
}
