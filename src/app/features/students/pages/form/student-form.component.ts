import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideCamera,
  LucideCheck,
  LucideChevronLeft,
  LucideChevronRight,
  LucideDynamicIcon,
  LucideFingerprint,
  LucideInfo,
  LucideLoaderCircle,
  LucidePencil,
  LucideSearch,
  LucideShieldCheck,
  LucideUserPlus,
} from '@lucide/angular';

type BiometricState = 'ready' | 'reading' | 'captured';

@Component({
  selector: 'app-student-form',
  imports: [FormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnDestroy {
  private readonly router = inject(Router);
  private timer?: number;

  protected step = signal(1);
  protected biometric = signal<BiometricState>('ready');
  protected readonly icons = {
    check: LucideCheck,
    back: LucideChevronLeft,
    next: LucideChevronRight,
    search: LucideSearch,
    guardian: LucideUserPlus,
    biometric: LucideFingerprint,
    reading: LucideLoaderCircle,
    security: LucideShieldCheck,
    camera: LucideCamera,
    info: LucideInfo,
    edit: LucidePencil,
  };
  protected student = {
    name: 'Gabriel Moreira da Silva',
    enrollment: '2026-0495',
    birthDate: '2012-05-18',
    className: '7º Ano B',
    shift: 'Manhã',
    status: 'Ativo',
  };
  protected guardian = {
    name: 'Mariana Moreira da Silva',
    relationship: 'Mãe',
    phone: '(11) 98765-4321',
    email: 'mariana.silva@email.com',
  };

  ngOnDestroy(): void {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
  }

  protected goTo(step: number): void {
    this.step.set(Math.min(4, Math.max(1, step)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected capture(): void {
    this.biometric.set('reading');
    this.timer = window.setTimeout(() => this.biometric.set('captured'), 1800);
  }

  protected complete(): void {
    this.router.navigate(['/admin/students/gabriel'], { queryParams: { created: '1' } });
  }
}


