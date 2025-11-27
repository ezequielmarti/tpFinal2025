import { Routes } from '@angular/router';
import { AccountProducts } from './accounts/account-products/account-products';
import { AccountDetails } from './accounts/account-details/account-details';
import { AccountTransactions } from './accounts/account-transactions/account-transactions';
import { Cart } from './accounts/cart/cart';
import { cartGuard } from './auth/cart-guard';
import { authGuard, adminGuard, sellerGuard, buyerGuard } from './general/auth-guards';
import { Checkout } from './accounts/checkout/checkout';
import { CheckoutResult } from './accounts/checkout-result/checkout-result';
import { ProductUpdate } from './accounts/product-update/product-update';
import { AccountsManagment } from './admin/accounts-managment/accounts-managment';
import { ProductsManagment } from './admin/products-managment/products-managment';
import { AccountMenu } from './general/account-menu/account-menu';
import { Category } from './general/category/category';
import { ProductDetails } from './general/product-details/product-details';
import { Search } from './general/search/search';
import { SignUp } from './general/sign-up/sign-up';
import { Login } from './general/login/login';
import { Home } from './general/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'sign-up', component: SignUp },
  { path: 'login', component: Login },
  { path: 'account', component: AccountMenu, canActivate: [authGuard] },
  { path: 'accountDetails', component: AccountDetails, canActivate: [authGuard] },
  { path: 'accountProducts', component: AccountProducts, canActivate: [sellerGuard] },
  { path: 'account-transactions', component: AccountTransactions, canActivate: [authGuard] },
  { path: 'cart', component: Cart, canActivate: [cartGuard] },
  { path: 'productUpdate/:id', component: ProductUpdate, canActivate: [sellerGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard, buyerGuard] },
  { path: 'checkoutResult', component: CheckoutResult, canActivate: [authGuard, buyerGuard] },
  { path: 'admin/accountsManagment', component: AccountsManagment, canActivate: [adminGuard] },
  { path: 'admin/productsManagment', component: ProductsManagment, canActivate: [adminGuard] },
  { path: 'category/:id', component: Category },
  { path: 'search', component: Search },
  { path: 'product/:id', component: ProductDetails },
  { path: 'account-products', redirectTo: 'accountProducts', pathMatch: 'full' },
  { path: 'account-details', redirectTo: 'accountDetails', pathMatch: 'full' },
  { path: 'product-update/:id', redirectTo: 'productUpdate/:id', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
