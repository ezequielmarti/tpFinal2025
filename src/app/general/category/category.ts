import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from './category-service';

@Component({
  selector: 'app-category',
  imports: [RouterModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class Category implements OnInit {
  protected readonly categorySignal = inject(CategoryService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.categorySignal.getTotalProducts(id);
    this.categorySignal.getProductsByCategory(id);
  }
}
