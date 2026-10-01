import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideDynamicIcon, LucideHelpCircle, LucideLockKeyhole, LucideShieldCheck } from '@lucide/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/authentication/auth.service';

@Component({ selector: 'app-reset-password', imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideDynamicIcon], templateUrl: './reset-password.component.html', styleUrl: '../activation/account-activation.component.scss' })
export class ResetPasswordComponent {
  private readonly auth = inject(AuthService); private readonly formBuilder = inject(FormBuilder); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  protected readonly token = this.route.snapshot.queryParamMap.get('token') ?? ''; protected readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  protected submitting = false; protected errorMessage = '';
  protected readonly icons = { shield: LucideShieldCheck, lock: LucideLockKeyhole, help: LucideHelpCircle };
  protected readonly form = this.formBuilder.nonNullable.group({ password: ['', [Validators.required, Validators.minLength(8)]], password_confirmation: ['', Validators.required] });
  protected submit(): void {
    if (!this.token || !this.email || this.form.invalid || this.submitting) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue(); if (value.password !== value.password_confirmation) { this.errorMessage = 'As senhas não coincidem.'; return; }
    this.submitting = true; this.errorMessage = '';
    this.auth.resetPassword({ email: this.email, token: this.token, ...value }).pipe(finalize(() => (this.submitting = false))).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { reset: '1' } }),
      error: (error: unknown) => { this.errorMessage = error instanceof HttpErrorResponse && error.error?.message ? error.error.message : 'Não foi possível redefinir a senha. O link pode ter expirado.'; },
    });
  }
}
