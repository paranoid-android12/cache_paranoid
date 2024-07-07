import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { mainPort } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }

  getData(endpoint: string) {
    //return this.http.get(mainPort + '/ACS-HAMMERHEAD-QUOTATION-WEBSITE/API-ACS-HAMMERHEAD/' + endpoint);
   return this.http.get(mainPort + '/api/' + endpoint);
  }

  postData(data: any, endpoint: string) {
    //return this.http.post(mainPort + '/ACS-HAMMERHEAD-QUOTATION-WEBSITE/API-ACS-HAMMERHEAD/' + endpoint, data.getRawValue(), { responseType: 'blob' });
    return this.http.post(mainPort + '/api/' + endpoint, data.getRawValue());
  }

  deleteData(data: any, endpoint: string){
    return this.http.delete(mainPort + '/api/' + endpoint);
  }
}
