import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideBell,
  LucideCalendarDays,
  LucideChevronDown,
  LucideCircleCheck,
  LucideClock3,
  LucideDynamicIcon,
  LucideHistory,
  LucideHouse,
  LucideLogOut,
  LucideSchool,
  LucideShieldCheck,
  LucideUserRound,
} from '@lucide/angular';
import { AuthService } from '../../../../core/authentication/auth.service';

type PortalView = 'home' | 'history';

@Component({
  selector: 'app-guardian-portal',
  imports: [LucideDynamicIcon],
  templateUrl: './guardian-portal.component.html',
  styleUrl: './guardian-portal.component.scss',
})
export class GuardianPortalComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly view = signal<PortalView>('home');
  protected readonly currentSchoolName = 'Colégio Horizonte';
  protected readonly icons = {
    school: LucideSchool,
    bell: LucideBell,
    signOut: LucideLogOut,
    home: LucideHouse,
    history: LucideHistory,
    profile: LucideUserRound,
    calendar: LucideCalendarDays,
    clock: LucideClock3,
    confirmed: LucideCircleCheck,
    protected: LucideShieldCheck,
    expand: LucideChevronDown,
  };
  protected readonly events = [
    { day: 'Hoje', time: '07:12', type: 'Entrada registrada', location: 'Portaria principal', variant: 'entry' },
    { day: 'Ontem', time: '17:04', type: 'Saída registrada', location: 'Portaria principal', variant: 'exit' },
    { day: 'Ontem', time: '07:09', type: 'Entrada registrada', location: 'Portaria principal', variant: 'entry' },
    { day: '02 set', time: '16:58', type: 'Saída registrada', location: 'Portaria principal', variant: 'exit' },
    { day: '02 set', time: '07:14', type: 'Entrada registrada', location: 'Portaria principal', variant: 'entry' },
  ];

  protected open(view: PortalView): void {
    this.view.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected signOut(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}


