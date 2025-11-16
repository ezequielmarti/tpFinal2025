import { Routes } from '@angular/router';
import { AccountProducts } from './accounts/account-products/account-products';
import { AccountDetails } from './accounts/account-details/account-details';
import { AccountTransactions } from './accounts/account-transactions/account-transactions';
import { Cart } from './accounts/cart/cart';
import { Category } from './general/category/category';
import { ProductDetails } from './general/product-details/product-details';
import { Search } from './general/search/search';
import { SignIn } from './general/sign-up/sign-up';
import { Login } from './general/login/login';
import { Home } from './general/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'sign-up', component: SignIn },
  { path: 'login', component: Login },
  { path: 'account-products', component: AccountProducts },
  { path: 'account-details', component: AccountDetails },
  { path: 'account-transactions', component: AccountTransactions },
  { path: 'cart', component: Cart },
  { path: 'category/:id', component: Category },
  { path: 'search', component: Search },
  { path: 'product/:id', component: ProductDetails },
  { path: '**', redirectTo: 'home' }
];
