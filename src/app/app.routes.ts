import { Routes } from '@angular/router';
import { authGuard } from './core/authentication/auth.guard';
import { guestGuard } from './core/authentication/guest.guard';
import { adminGuard } from './core/authentication/admin.guard';
import { guardianGuard } from './core/authentication/guardian.guard';
import { administrationLandingGuard } from './core/authentication/administration-landing.guard';
import { permissionGuard } from './core/authentication/permission.guard';
import { staffGuard } from './core/authentication/staff.guard';
import { terminalGuard } from './core/authentication/terminal.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/authentication/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'ativar-conta',
    loadComponent: () =>
      import('./features/authentication/pages/activation/account-activation.component').then(
        (m) => m.AccountActivationComponent,
      ),
  },
  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import('./features/authentication/pages/password-recovery/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import('./features/authentication/pages/password-recovery/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, staffGuard],
    loadComponent: () =>
      import('./features/administration/layout/administration-layout.component').then(
        (m) => m.AdministrationLayoutComponent,
      ),
    children: [
      {
        path: '',
        canActivate: [administrationLandingGuard],
        loadComponent: () =>
          import('./features/dashboard/pages/overview/overview.component').then(
            (m) => m.OverviewComponent,
          ),
      },
      {
        path: 'students',
        canActivate: [permissionGuard],
        data: { permissions: ['students.view'] },
        loadComponent: () =>
          import('./features/students/pages/list/student-list.component').then(
            (m) => m.StudentListComponent,
          ),
      },
      {
        path: 'students/new',
        canActivate: [permissionGuard],
        data: { permissions: ['students.create'] },
        loadComponent: () =>
          import('./features/students/pages/form/student-form.component').then(
            (m) => m.StudentFormComponent,
          ),
      },
      {
        path: 'students/:id',
        canActivate: [permissionGuard],
        data: { permissions: ['students.view'] },
        loadComponent: () =>
          import('./features/students/pages/details/student-details.component').then(
            (m) => m.StudentDetailsComponent,
          ),
      },
      {
        path: 'access-records',
        canActivate: [permissionGuard],
        data: { permissions: ['access_records.view'] },
        loadComponent: () =>
          import('./features/access-records/pages/history/access-history.component').then(
            (m) => m.AccessHistoryComponent,
          ),
      },
      {
        path: 'school-classes',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/school-classes/pages/list/school-class-list.component').then(
            (m) => m.SchoolClassListComponent,
          ),
      },
      {
        path: 'employees',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/administration/pages/employees/list/employee-list.component').then(
            (m) => m.EmployeeListComponent,
          ),
      },
      {
        path: 'employees/new',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/administration/pages/employees/form/employee-form.component').then(
            (m) => m.EmployeeFormComponent,
          ),
      },
      {
        path: 'employees/:id',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/administration/pages/employees/details/employee-details.component').then(
            (m) => m.EmployeeDetailsComponent,
          ),
      },
      {
        path: 'guardians',
        canActivate: [permissionGuard],
        data: { permissions: ['students.create'] },
        loadComponent: () =>
          import('./features/administration/pages/guardians/list/guardian-list.component').then(
            (m) => m.GuardianListComponent,
          ),
      },
      {
        path: 'guardians/new',
        canActivate: [permissionGuard],
        data: { permissions: ['students.create'] },
        loadComponent: () =>
          import('./features/administration/pages/guardians/form/guardian-form.component').then(
            (m) => m.GuardianFormComponent,
          ),
      },
      {
        path: 'guardians/:id',
        canActivate: [permissionGuard],
        data: { permissions: ['students.create'] },
        loadComponent: () =>
          import('./features/administration/pages/guardians/details/guardian-details.component').then(
            (m) => m.GuardianDetailsComponent,
          ),
      },
    ],
  },
  {
    path: 'guardian',
    canActivate: [authGuard, guardianGuard],
    loadComponent: () =>
      import('./features/guardian/pages/portal/guardian-portal.component').then(
        (m) => m.GuardianPortalComponent,
      ),
  },
  {
    path: 'terminal',
    canActivate: [terminalGuard],
    loadComponent: () =>
      import('./features/terminal/pages/access-control/access-terminal.component').then(
        (m) => m.AccessTerminalComponent,
      ),
  },
  { path: '**', redirectTo: 'login' },
];
