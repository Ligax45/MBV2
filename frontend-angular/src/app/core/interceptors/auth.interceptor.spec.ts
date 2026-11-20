import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attache withCredentials aux appels /api', () => {
    void firstValueFrom(http.get('/api/recipes'));
    const req = httpMock.expectOne('/api/recipes');
    expect(req.request.withCredentials).toBe(true);
    req.flush([]);
  });

  it('tente un refresh puis retry sur 401 API', async () => {
    const refreshSpy = vi
      .spyOn(auth, 'refreshAccessToken')
      .mockReturnValue(of(undefined));

    const pending = firstValueFrom(http.get('/api/recipes/1'));

    const first = httpMock.expectOne('/api/recipes/1');
    first.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    await Promise.resolve();

    const retry = httpMock.expectOne('/api/recipes/1');
    retry.flush({ id: '1' });

    await expect(pending).resolves.toEqual({ id: '1' });
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('ne tente pas de refresh sur /auth/login 401', async () => {
    const refreshSpy = vi.spyOn(auth, 'refreshAccessToken');
    const pending = firstValueFrom(http.post('/api/auth/login', {})).catch(
      (err: unknown) => err,
    );

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(
      { message: 'bad' },
      { status: 401, statusText: 'Unauthorized' },
    );

    const err = await pending;
    expect(err).toBeInstanceOf(HttpErrorResponse);
    expect(refreshSpy).not.toHaveBeenCalled();
  });
});
