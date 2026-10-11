import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that prevents administrators from accessing the standard workspaces view (/workspaces).
 * Administrators manage workspaces directly in the Admin Console (/admin), so any admin navigating to
 * /workspaces is redirected to /admin.
 */
export const workspacesGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return router.createUrlTree(['/admin']);
  }

  return true;
};
