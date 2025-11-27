import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountProductService } from './account-products-service';
import { ERole } from '../../../enum/role';
import { AuthService } from '../../general/login/auth-managment';

@Component({
  selector: 'app-account-products',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './account-products.html',
  styleUrl: './account-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProducts {
  protected readonly authSignal = inject(AuthService);
  protected readonly productSignal = inject(AccountProductService);
  protected readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly categories = ['electronica', 'deportes', 'hogar', 'moda'];
  protected readonly tags = [
    '5g','ac','anc','aroma','audio','bag','bike','blender','bottle','camera','chair','chino','coffee','curtain','desk',
    'dress','fitness','formal','fridge','gaming','gloves','gym','helmet','homegym','hoodie','iron','jacket','jeans',
    'kettle','kitchen','lamp','laptop','laundry','leather','mat','mattress','monitor','mouse','mtb','office','oled',
    'outdoor','oven','peripheral','phone','photo','pillow','portable','robot','running','scarf','sheets','shirt','shoes',
    'short','sneaker','storage','tablet','towel','training','tshirt','vacuum','wearable','weights','wireless'
  ];
  protected readonly generate = signal(false);
  private fetched = false;

  protected readonly authState = computed(() => this.authSignal.authState());
  protected readonly canSell = computed(() => {
    const role = this.authState().role;
    return role === ERole.Seller || role === ERole.Business;
  });
  protected readonly noAccess = computed(() => !this.authState().logged || !this.canSell());

  protected readonly createForm: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    category: FormControl<string>;
    brand: FormControl<string>;
    price: FormControl<number | null>;
    stock: FormControl<number | null>;
    discount: FormControl<number | null>;
    tags: FormControl<string[]>;
  }> = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    brand: ['', Validators.required],
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    stock: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    discount: this.fb.control<number | null>(0, [Validators.min(0), Validators.max(100)]),
    tags: this.fb.nonNullable.control<string[]>([]),
  });

  constructor() {
    effect(
      () => {
        const auth = this.authState();
        if (auth.logged && this.canSell() && !this.fetched) {
          this.productSignal.getProductList();
          this.fetched = true;
        }
      },
      { allowSignalWrites: true }
    );
  }

  onGenerate(): void {
    this.createForm.reset({
      title: '',
      description: '',
      category: '',
      brand: '',
      price: null,
      stock: null,
      discount: 0,
      tags: [],
    });
    this.generate.set(true);
  }

  onCancel(): void {
    this.generate.set(false);
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const value = this.createForm.getRawValue();
    const tags = value.tags && value.tags.length ? value.tags : undefined;
    this.productSignal.createProduct({
      title: value.title,
      description: value.description,
      category: value.category,
      brand: value.brand,
      price: value.price ?? 0,
      stock: value.stock ?? 0,
      discountPercentage: value.discount ?? 0,
      tags
    });
    this.generate.set(false);
  }

  onTagToggle(tag: string, checked: boolean): void {
    const current = this.createForm.controls.tags.value || [];
    const next = checked ? Array.from(new Set([...current, tag])) : current.filter((t) => t !== tag);
    this.createForm.controls.tags.setValue(next);
  }

  onEdit(id: string): void {
    this.router.navigate(['/productUpdate', id]);
  }
}
