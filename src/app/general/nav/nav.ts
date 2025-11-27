import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ERole } from '../../../enum/role';
import { CartService } from '../../accounts/cart/cart-service';
import { AuthService } from '../login/auth-managment';

@Component({
  selector: 'app-nav',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nav {
  protected readonly authSignal = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);

  readonly Role = ERole;

  private readonly routerEvents = toSignal(
    this.router.events.pipe(filter((ev): ev is NavigationEnd => ev instanceof NavigationEnd)),
    { initialValue: null }
  );

  readonly authState = computed(() => this.authSignal.authState());
  readonly currentUrl = computed(() => {
    const ev = this.routerEvents();
    if (ev) {
      return ev.urlAfterRedirects || ev.url || '/home';
    }
    return this.router.url || '/home';
  });
  readonly userInitial = computed(() => this.authState().username?.charAt(0).toUpperCase() ?? '');

  readonly searchForm = this.fb.nonNullable.group({
    query: [''],
  });

  protected readonly userMenuOpen = signal(false);
  protected readonly categoryOpen = signal(false);

  constructor() {
    effect(() => {
      if (!this.authState().logged) {
        this.userMenuOpen.set(false);
      }
    });
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  toggleCategoryMenu(): void {
    this.categoryOpen.update((open) => !open);
  }

  closeCategoryMenu(): void {
    this.categoryOpen.set(false);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  onSearch(): void {
    const q = this.searchForm.controls.query.value.trim();
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
    this.searchForm.reset({ query: '' });
  }

  logout(): void {
    this.authSignal.logOut();
    this.router.navigate(['/home']);
  }
}
