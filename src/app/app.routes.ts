import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { workspacesGuard } from './core/guards/workspaces.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth').then((m) => m.AuthComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'workspaces',
    canActivate: [authGuard, workspacesGuard],
    loadComponent: () =>
      import('./features/workspaces/workspaces').then((m) => m.WorkspacesComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'profile/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin').then((m) => m.AdminComponent),
  },
  {
    path: 'email-confirmation',
    loadComponent: () =>
      import('./features/email-confirmation/email-confirmation').then(
        (m) => m.EmailConfirmationComponent,
      ),
  },
  {
    path: 'confirm-email',
    loadComponent: () =>
      import('./features/email-confirmation/email-confirmation').then(
        (m) => m.EmailConfirmationComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
