import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { getRoleGroup, ERole } from '../../../enum/role';
import { AuthService } from '../login/auth-managment';

@Component({
  selector: 'app-nav',
  imports: [RouterModule, UpperCasePipe],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected readonly authSignal = inject(AuthService);
  private router = inject(Router);
  getRoleGroup = getRoleGroup;
  Role = ERole;
  get currentUrl(): string {
    return this.router.url || '/home';
  }

  onSearch(term: string, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    const q = term.trim();
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  logout() {
    this.authSignal.logOut();
    this.router.navigate(['/home']);
  }
}
