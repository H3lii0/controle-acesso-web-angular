import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected submitting = false;
  protected errorMessage = '';
  protected infoMessage = '';
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
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) this.router.navigate(['/ativar-conta'], { queryParams: { token } });
    if (this.route.snapshot.queryParamMap.get('activated') === '1') {
      this.infoMessage = 'Conta ativada. Agora você já pode entrar com sua senha.';
    }
    if (this.route.snapshot.queryParamMap.get('reset') === '1') {
      this.infoMessage = 'Senha redefinida com sucesso. Entre com a nova senha.';
    }
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
        next: (session) => {
          const destination = session.user.account_type === 'guardian' ? '/guardian' : '/admin';
          this.router.navigateByUrl(destination);
        },
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


