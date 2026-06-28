import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthService } from '@core/services/auth.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          /** Aligné sur ThemeService : classe `.dark` sur <html> */
          darkModeSelector: '.dark',
        },
      },
    }),
    MessageService,
    provideAppInitializer(() => inject(AuthService).restoreSession()),
  ],
};
