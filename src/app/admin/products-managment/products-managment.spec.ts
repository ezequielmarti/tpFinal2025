import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsManagment } from './products-managment';

describe('ProductsManagment', () => {
  let component: ProductsManagment;
  let fixture: ComponentFixture<ProductsManagment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsManagment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsManagment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
