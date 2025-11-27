import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductDetailsService } from './product-details-service';
import { AuthService } from '../login/auth-managment';
import { CreateReviewSchema } from '../../../schema/Product/createReview';
import { ERole } from '../../../enum/role';
import { CartService } from '../../accounts/cart/cart-service';

@Component({
  selector: 'app-product-details',
  imports: [RouterModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetails {
  protected readonly productSignal = inject(ProductDetailsService);
  protected readonly authSignal = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly fallbackImage = 'https://picsum.photos/seed/fallback/600';
  protected readonly selectedRating = signal(5);

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly productState = computed(() => this.productSignal.productState());
  protected readonly productData = computed(() => this.productState().data);
  protected readonly authState = computed(() => this.authSignal.authState());
  protected readonly canBuy = computed(() => {
    const auth = this.authState();
    if (!auth.logged) return false;
    if (auth.role === ERole.Admin || auth.role === ERole.Business) return false;
    return !this.isOwner();
  });

  protected readonly finalPrice = computed(() => {
    const data = this.productData();
    if (!data) return null;
    const discount = data.discountPercentage || 0;
    return data.price - (data.price * discount) / 100;
  });

  protected readonly shippingMessage = computed(() => {
    const price = this.finalPrice();
    const data = this.productData();
    if (!data || price === null) return '';
    if (price >= 150000) return 'Envío gratis en tu compra';
    if (data.weight > 3) return 'Envío estimado $3500';
    return 'Envío estimado $1800';
  });

  protected readonly isOwner = computed(() => {
    const auth = this.authState();
    const prod = this.productData();
    if (!auth.logged || !prod) return false;
    const ownerId = (prod as any).ownerId;
    if (ownerId && auth.id) {
      return ownerId === auth.id;
    }
    if (auth.username) {
      const ownerName = (prod as any).accountName;
      if (ownerName) {
        return ownerName.toLowerCase() === auth.username.toLowerCase();
      }
    }
    return false;
  });

  protected readonly hasReview = computed(() => {
    const prod = this.productData();
    const user = this.authState().username?.toLowerCase();
    if (!prod || !user) return false;
    return prod.reviews?.some((r) => r.username?.toLowerCase() === user) ?? false;
  });

  protected readonly canReview = computed(() => {
    const auth = this.authState();
    const prod = this.productData();
    if (!auth.logged || !prod) return false;
    return !this.hasReview();
  });

  protected readonly reviewForm = this.fb.nonNullable.group({
    comment: ['', Validators.maxLength(500)],
  });

  constructor() {
    effect(() => {
      const id = this.params().get('id');
      if (id) {
        this.productSignal.getProduct(id);
      }
    });
  }

  setRating(value: number): void {
    this.selectedRating.set(value);
  }

  submitReview(): void {
    const prod = this.productData();
    const username = this.authState().username;
    if (!prod || !username || !this.canReview()) {
      return;
    }

    const payload: CreateReviewSchema = {
      productId: prod.id,
      rating: this.selectedRating(),
      comment: this.cleanComment(this.reviewForm.controls.comment.value),
    };

    this.productSignal.createReview(payload);
    this.reviewForm.reset({ comment: '' });
  }

  deleteReview(): void {
    const prod = this.productData();
    if (!prod) return;
    this.productSignal.deleteReview(prod.id);
  }

  addToCart(): void {
    const prod = this.productData();
    if (!prod || !this.canBuy()) return;
    this.cartService.addToCart({
      productId: prod.id,
      title: prod.title,
      price: this.finalPrice() ?? prod.price,
      amount: 1
    });
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  private cleanComment(value: string): string {
    const trimmed = value.trim();
    return trimmed || 'Sin comentario';
  }
}
