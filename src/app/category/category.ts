import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CategoryService } from './category-managment';

@Component({
  selector: 'app-category',
  imports: [],
  templateUrl: './category.html',
  styleUrl: './category.css',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class Category {
  protected readonly categorySignal = inject(CategoryService);
}
