import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from './cart-service';
import { CartProductSchema } from '../../../schema/cart/cart-product';
import { AuthService } from '../../general/login/auth-managment';

@Component({
  selector: 'app-cart',
  imports: [RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly authSignal = inject(AuthService);

  protected readonly cartState = computed(() => this.cartService.cartState());
  protected readonly items = computed<CartProductSchema[]>(() => this.cartState().data?.products ?? []);
  protected readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.amount, 0)
  );
  protected readonly authState = computed(() => this.authSignal.authState());

  constructor() {
    effect(
      () => {
        this.cartService.getCart();
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const auth = this.authState();
      if (!auth.logged) {
        this.router.navigate(['/home']);
      }
    });
  }

  increase(productId: string): void {
    this.cartService.updateQuantity(productId, 1);
  }

  decrease(productId: string): void {
    this.cartService.updateQuantity(productId, -1);
  }

  remove(productId: string): void {
    this.cartService.removeItem(productId);
  }

  clear(): void {
    this.cartService.deleteCart();
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }
}
