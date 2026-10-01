import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon, LucideHelpCircle, LucideLockKeyhole, LucideMail, LucideShieldCheck } from '@lucide/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/authentication/auth.service';

@Component({ selector: 'app-forgot-password', imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideDynamicIcon], templateUrl: './forgot-password.component.html', styleUrl: '../activation/account-activation.component.scss' })
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  protected submitting = false;
  protected submitted = false;
  protected errorMessage = '';
  protected readonly icons = { shield: LucideShieldCheck, lock: LucideLockKeyhole, email: LucideMail, help: LucideHelpCircle };
  protected readonly form = this.formBuilder.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  protected submit(): void {
    if (this.form.invalid || this.submitting) { this.form.markAllAsTouched(); return; }
    this.submitting = true; this.errorMessage = '';
    this.auth.requestPasswordReset(this.form.getRawValue()).pipe(finalize(() => (this.submitting = false))).subscribe({
      next: () => (this.submitted = true),
      error: (error: unknown) => { this.errorMessage = error instanceof HttpErrorResponse && error.error?.message ? error.error.message : 'Não foi possível solicitar a recuperação agora. Tente novamente.'; },
    });
  }
}
