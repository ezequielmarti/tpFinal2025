import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductDetailsService } from './product-details-service';
import { AuthService } from '../../service/auth-managment';
import { getRoleGroup } from '../../../enum/role';
import { CreateReview } from '../../../schema/Product/createReview';
import { Role } from '../../../enum/role';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  protected readonly productSignal = inject(ProductDetailsService);
  protected readonly authSignal = inject(AuthService);
  private route = inject(ActivatedRoute);
  getRoleGroup = getRoleGroup;
  stars = [1, 2, 3, 4, 5];
  selectedRating = 5;
  Role = Role;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productSignal.getProduct(id);
    }
  }

  isOwner(): boolean {
    const auth = this.authSignal.authState();
    const prod = this.productSignal.productState().data;
    if (!auth.logged || !prod) return false;
    const ownerId = (prod as any).ownerId;
    const ownerName = (prod as any).accountName;
    if (ownerName && auth.username) {
      return ownerName.toLowerCase() === auth.username.toLowerCase();
    }
    if (ownerId && auth.username) {
      // en mock ownerId es distinto al username, no se puede comparar con el auth actual
      return false;
    }
    return false;
  }

  myReviewUsername(): string | null {
    const auth = this.authSignal.authState();
    return auth.username || null;
  }

  hasReview(): boolean {
    const prod = this.productSignal.productState().data;
    const user = this.myReviewUsername();
    return !!(user && prod?.reviews?.some(r => r.username?.toLowerCase() === user.toLowerCase()));
  }

  submitReview(rating: number, comment: string) {
    const prod = this.productSignal.productState().data;
    const user = this.myReviewUsername();
    if (!prod || !user) return;
    const payload: CreateReview = {
      productId: prod.id,
      rating: rating || this.selectedRating || 5,
      comment: comment?.trim() || 'Sin comentario'
    };
    this.productSignal.createReview(payload);
  }

  deleteReview() {
    const prod = this.productSignal.productState().data;
    if (!prod) return;
    this.productSignal.deleteReview(prod.id);
  }

  setRating(value: number) {
    this.selectedRating = value;
  }
}
