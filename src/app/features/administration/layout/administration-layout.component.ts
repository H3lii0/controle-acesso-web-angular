import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideBell,
  LucideChartNoAxesColumn,
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMonitor,
  LucideScanLine,
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
export class AdministrationLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly schoolName = 'Colégio Horizonte';
  protected readonly userName = this.auth.sessionSnapshot?.user.full_name ?? 'Administrador';
  protected readonly icons = {
    dashboard: LucideLayoutDashboard,
    students: LucideGraduationCap,
    accessRecords: LucideScanLine,
    alerts: LucideTriangleAlert,
    guardians: LucideUsers,
    terminals: LucideMonitor,
    reports: LucideChartNoAxesColumn,
    settings: LucideSettings,
    team: LucideShieldCheck,
    notifications: LucideBell,
    signOut: LucideLogOut,
  };

  protected signOut(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}


