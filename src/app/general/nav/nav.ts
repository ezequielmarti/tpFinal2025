import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-managment';
import { getRoleGroup, Role } from '../../../enum/role';

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
  Role = Role;
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
