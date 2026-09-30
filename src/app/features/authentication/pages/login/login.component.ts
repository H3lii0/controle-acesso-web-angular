import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideEye,
  LucideEyeOff,
  LucideHelpCircle,
  LucideLockKeyhole,
  LucideMail,
  LucideShieldCheck,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/authentication/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected submitting = false;
  protected errorMessage = '';
  protected readonly showPassword = signal(false);
  protected readonly icons = {
    shield: LucideShieldCheck,
    lock: LucideLockKeyhole,
    email: LucideMail,
    show: LucideEye,
    hide: LucideEyeOff,
    help: LucideHelpCircle,
  };

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['admin@example.test', [Validators.required, Validators.email]],
    password: ['password', [Validators.required]],
  });

  ngOnInit(): void {
    this.auth.prepareCsrfCookie().subscribe();
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/admin'),
        error: (error: unknown) => {
          this.errorMessage = this.resolveErrorMessage(error);
        },
      });
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      return 'E-mail ou senha inválidos.';
    }

    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Não foi possível conectar com a API. Verifique se o Laravel está rodando.';
    }

    return 'Não foi possível entrar agora. Tente novamente em alguns instantes.';
  }
}


