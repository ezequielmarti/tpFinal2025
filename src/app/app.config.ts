import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './service/auth-managment';
import { firstValueFrom } from 'rxjs';
import { Url } from '../common/const';

function initializeAuth() {
  const authService = inject(AuthService);
  // Si no hay URL de backend, saltar el refresh para modo mock/local
  if (!Url) {
    return Promise.resolve(true);
  }
  return firstValueFrom(authService.refresh());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes),
    provideAppInitializer(initializeAuth)
  ]
};
