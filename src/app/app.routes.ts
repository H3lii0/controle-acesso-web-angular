import { Routes } from '@angular/router';
import { authGuard } from './core/authentication/auth.guard';
import { guestGuard } from './core/authentication/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/authentication/pages/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'admin', canActivate: [authGuard],
    loadComponent: () => import('./features/administration/layout/administration-layout.component').then((m) => m.AdministrationLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/pages/overview/overview.component').then((m) => m.OverviewComponent) },
      { path: 'students', loadComponent: () => import('./features/students/pages/list/student-list.component').then((m) => m.StudentListComponent) },
      { path: 'students/new', loadComponent: () => import('./features/students/pages/form/student-form.component').then((m) => m.StudentFormComponent) },
      { path: 'students/:id', loadComponent: () => import('./features/students/pages/details/student-details.component').then((m) => m.StudentDetailsComponent) },
      { path: 'access-records', loadComponent: () => import('./features/access-records/pages/history/access-history.component').then((m) => m.AccessHistoryComponent) },
    ],
  },
  { path: 'guardian', canActivate: [authGuard], loadComponent: () => import('./features/guardian/pages/portal/guardian-portal.component').then((m) => m.GuardianPortalComponent) },
  { path: 'terminal', canActivate: [authGuard], loadComponent: () => import('./features/terminal/pages/access-control/access-terminal.component').then((m) => m.AccessTerminalComponent) },
  { path: '**', redirectTo: 'login' },
];


