import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpdateProductSchema } from '../../../schema/Product/createProduct';
import { AuthService } from '../../general/login/auth-managment';
import { ProductUpdateService } from './product-update-service';
import { Location } from '@angular/common';

type ProductForm = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  category: FormControl<string>;
  brand: FormControl<string>;
  price: FormControl<number | null>;
  stock: FormControl<number | null>;
  discount: FormControl<number | null>;
  tags: FormControl<string[]>;
}>;

@Component({
  selector: 'app-product-update',
  imports: [ReactiveFormsModule],
  templateUrl: './product-update.html',
  styleUrl: './product-update.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductUpdate {
  protected readonly productSignal = inject(ProductUpdateService);
  private readonly authSignal = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);
  protected readonly categories = ['electronica', 'deportes', 'hogar', 'moda'];
  protected readonly tagsList = [
    '5g','ac','anc','aroma','audio','bag','bike','blender','bottle','camera','chair','chino','coffee','curtain','desk',
    'dress','fitness','formal','fridge','gaming','gloves','gym','helmet','homegym','hoodie','iron','jacket','jeans',
    'kettle','kitchen','lamp','laptop','laundry','leather','mat','mattress','monitor','mouse','mtb','office','oled',
    'outdoor','oven','peripheral','phone','photo','pillow','portable','robot','running','scarf','sheets','shirt','shoes',
    'short','sneaker','storage','tablet','towel','training','tshirt','vacuum','wearable','weights','wireless'
  ];

  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  protected readonly authState = computed(() => this.authSignal.authState());
  protected readonly productState = computed(() => this.productSignal.productState());
  protected readonly productData = computed(() => this.productState().data);
  private readonly submitted = signal(false);

  protected readonly form: ProductForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    brand: ['', Validators.required],
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    stock: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    discount: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(100)]),
    tags: this.fb.nonNullable.control<string[]>([]),
  });

  constructor() {
    effect(
      () => {
        const auth = this.authState();
        if (!auth.logged) {
          this.router.navigate(['/']);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const id = this.params().get('id');
        if (id) {
          this.productSignal.getProduct(id);
        }
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const data = this.productData();
      if (data) {
        this.form.reset({
          title: data.title,
          description: data.description,
          category: data.category as unknown as string,
          brand: data.brand,
          price: data.price,
          stock: data.stock,
          discount: data.discountPercentage,
          tags: data.tags ?? [],
        });
      }
    });

    effect(
      () => {
        if (this.submitted() && !this.productState().loading && this.productState().data) {
          this.submitted.set(false);
          this.location.back();
        }
      },
      { allowSignalWrites: true }
    );
  }

  onSubmit(): void {
    const data = this.productData();
    if (!data) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const tags = value.tags && value.tags.length ? value.tags : data.tags;
    const update: UpdateProductSchema & { id: string; discountPercentage?: number } = {
      id: data.id,
      title: value.title || data.title,
      description: value.description || data.description,
      category: (value.category as any) || data.category,
      brand: value.brand || data.brand,
      price: value.price ?? data.price,
      stock: value.stock ?? data.stock,
      discountPercentage: value.discount ?? data.discountPercentage,
      tags,
    };

    this.productSignal.updateProduct(update as any);
    this.submitted.set(true);
  }

  onCancel(): void {
    this.router.navigate(['/accountProducts']);
  }

  onTagToggle(tag: string, checked: boolean): void {
    const current = this.form.controls.tags.value || [];
    const next = checked ? Array.from(new Set([...current, tag])) : current.filter((t) => t !== tag);
    this.form.controls.tags.setValue(next);
  }
}
