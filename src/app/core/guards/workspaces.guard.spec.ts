import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { workspacesGuard } from './workspaces.guard';
import { AuthService } from '../services/auth.service';

describe('workspacesGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'isAdmin']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('workspacesGuard_Should_RedirectToAdmin_When_UserIsAuthenticatedAndAdmin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(true);
    const mockTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockTree);

    const result = TestBed.runInInjectionContext(() => workspacesGuard({} as any, {} as any));

    expect(result).toBe(mockTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/admin']);
  });

  it('workspacesGuard_Should_AllowAccess_When_UserIsNotAdmin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => workspacesGuard({} as any, {} as any));

    expect(result).toBeTrue();
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });
});
