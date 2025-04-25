import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

const API_URL = 'http://localhost:8080/api/test/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getApprenantBoard(): Observable<any> {
    return this.http.get(API_URL + 'apprenant', { responseType: 'text' });
  }

  getResponsableBoard(): Observable<any> {
    return this.http.get(API_URL + 'responsable', { responseType: 'text' });
  }

  getDirecteurBoard(): Observable<any> {
    return this.http.get(API_URL + 'directeur', { responseType: 'text' });
  }
}
