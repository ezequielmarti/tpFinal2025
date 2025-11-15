import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './service/auth-managment';
import { firstValueFrom } from 'rxjs';

function initializeAuth() {
  const authService = inject(AuthService);
  return firstValueFrom(authService.refresh());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAppInitializer(initializeAuth)
  ]
};
