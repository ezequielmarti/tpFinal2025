import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Url } from '../../../common/const';
import { AuthService } from '../../service/auth-managment';

@Injectable({
  providedIn: 'root',
})
export class AccountTransactionsService {
  private apiUrl = `${Url}/product`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  
}
