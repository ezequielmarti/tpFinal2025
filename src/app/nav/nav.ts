import { Component, inject } from '@angular/core';
import { AuthService } from '../service/auth-managment';
import { AccountMenu } from "../account-menu/account-menu";

@Component({
  selector: 'app-nav',
  imports: [AccountMenu],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected readonly authSignal = inject(AuthService);
}
