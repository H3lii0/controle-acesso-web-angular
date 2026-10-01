import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideChartNoAxesColumn,
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMonitor,
  LucideScanLine,
  LucideSchool,
  LucideSettings,
  LucideShieldCheck,
  LucideTriangleAlert,
  LucideUsers,
} from '@lucide/angular';
import { AuthService } from '../../../core/authentication/auth.service';

@Component({
  selector: 'app-administration-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './administration-layout.component.html',
  styleUrl: './administration-layout.component.scss',
})
export class AdministrationLayoutComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly schoolName = 'Colégio Horizonte';
  protected readonly userName = this.auth.sessionSnapshot?.user.full_name ?? 'Administrador';
  protected readonly currentDateTime = signal(new Date());
  private readonly clock = setInterval(() => this.currentDateTime.set(new Date()), 1000);
  protected readonly icons = {
    dashboard: LucideLayoutDashboard,
    students: LucideGraduationCap,
    schoolClasses: LucideSchool,
    accessRecords: LucideScanLine,
    alerts: LucideTriangleAlert,
    guardians: LucideUsers,
    terminals: LucideMonitor,
    reports: LucideChartNoAxesColumn,
    settings: LucideSettings,
    team: LucideShieldCheck,
    signOut: LucideLogOut,
  };

  ngOnDestroy(): void { clearInterval(this.clock); }

  protected formatDateTime(value: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Recife',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(value);
  }

  protected can(permission: string): boolean {
    const user = this.auth.sessionSnapshot?.user;
    return user?.account_type === 'central_administrator' || user?.permissions.includes(permission) === true;
  }

  protected isCentralAdministrator(): boolean {
    return this.auth.sessionSnapshot?.user.account_type === 'central_administrator';
  }

  protected signOut(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}


