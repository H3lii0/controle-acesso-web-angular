import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideScanLine,
  LucideSchool,
  LucideSettings,
  LucideShieldCheck,
  LucideUsers,
} from '@lucide/angular';
import { AuthService } from '../../../core/authentication/auth.service';
import { SettingsService } from '../../../core/settings/settings.service';

@Component({
  selector: 'app-administration-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './administration-layout.component.html',
  styleUrl: './administration-layout.component.scss',
})
export class AdministrationLayoutComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly settingsService = inject(SettingsService);

  protected readonly schoolName = this.settingsService.schoolName;
  protected readonly userName = this.auth.sessionSnapshot?.user.full_name ?? 'Administrador';
  protected readonly currentDateTime = signal(new Date());
  private readonly clock = setInterval(() => this.currentDateTime.set(new Date()), 1000);
  protected readonly icons = {
    dashboard: LucideLayoutDashboard,
    students: LucideGraduationCap,
    schoolClasses: LucideSchool,
    accessRecords: LucideScanLine,
    guardians: LucideUsers,
    settings: LucideSettings,
    team: LucideShieldCheck,
    signOut: LucideLogOut,
  };

  constructor() {
    this.settingsService.school().subscribe();
  }

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


