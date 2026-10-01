import { Routes } from '@angular/router';
import { authGuard } from './core/authentication/auth.guard';
import { guestGuard } from './core/authentication/guest.guard';
import { adminGuard } from './core/authentication/admin.guard';
import { guardianGuard } from './core/authentication/guardian.guard';
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
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/administration/layout/administration-layout.component').then(
        (m) => m.AdministrationLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/pages/overview/overview.component').then(
            (m) => m.OverviewComponent,
          ),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/students/pages/list/student-list.component').then(
            (m) => m.StudentListComponent,
          ),
      },
      {
        path: 'students/new',
        loadComponent: () =>
          import('./features/students/pages/form/student-form.component').then(
            (m) => m.StudentFormComponent,
          ),
      },
      {
        path: 'students/:id',
        loadComponent: () =>
          import('./features/students/pages/details/student-details.component').then(
            (m) => m.StudentDetailsComponent,
          ),
      },
      {
        path: 'access-records',
        loadComponent: () =>
          import('./features/access-records/pages/history/access-history.component').then(
            (m) => m.AccessHistoryComponent,
          ),
      },
      {
        path: 'school-classes',
        loadComponent: () =>
          import('./features/school-classes/pages/list/school-class-list.component').then(
            (m) => m.SchoolClassListComponent,
          ),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/administration/pages/employees/list/employee-list.component').then(
            (m) => m.EmployeeListComponent,
          ),
      },
      {
        path: 'employees/new',
        loadComponent: () =>
          import('./features/administration/pages/employees/form/employee-form.component').then(
            (m) => m.EmployeeFormComponent,
          ),
      },
      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./features/administration/pages/employees/details/employee-details.component').then(
            (m) => m.EmployeeDetailsComponent,
          ),
      },
      {
        path: 'guardians',
        loadComponent: () =>
          import('./features/administration/pages/guardians/list/guardian-list.component').then(
            (m) => m.GuardianListComponent,
          ),
      },
      {
        path: 'guardians/new',
        loadComponent: () =>
          import('./features/administration/pages/guardians/form/guardian-form.component').then(
            (m) => m.GuardianFormComponent,
          ),
      },
      {
        path: 'guardians/:id',
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
