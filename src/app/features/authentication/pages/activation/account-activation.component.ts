import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideDynamicIcon, LucideLockKeyhole, LucideShieldCheck } from '@lucide/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/authentication/auth.service';

@Component({ selector: 'app-account-activation', imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideDynamicIcon], templateUrl: './account-activation.component.html', styleUrl: './account-activation.component.scss' })
export class AccountActivationComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  protected submitting = false;
  protected errorMessage = '';
  protected readonly icons = { shield: LucideShieldCheck, lock: LucideLockKeyhole };
  protected readonly form = this.formBuilder.nonNullable.group({ password: ['', [Validators.required, Validators.minLength(8)]], password_confirmation: ['', Validators.required] });

  protected submit(): void {
    if (!this.token || this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.password !== value.password_confirmation) { this.errorMessage = 'As senhas não coincidem.'; return; }
    this.submitting = true; this.errorMessage = '';
    this.auth.activateAccount(this.token, value.password, value.password_confirmation).pipe(finalize(() => (this.submitting = false))).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { activated: '1' } }),
      error: (error: unknown) => { this.errorMessage = error instanceof HttpErrorResponse && error.error?.message ? error.error.message : 'Não foi possível ativar a conta. O convite pode ter expirado.'; },
    });
  }
}
