import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Url } from '../../../common/const';

@Injectable({
  providedIn: 'root',
})
export class AccountsManagmentService {
  private apiUrl = `${Url}/account`;
  private http = inject(HttpClient);

}
