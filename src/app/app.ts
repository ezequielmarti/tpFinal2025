import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './general/nav/nav';
import { AuthService } from './service/auth-managment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly authSignal = inject(AuthService);
}
