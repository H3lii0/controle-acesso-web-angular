import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { Input } from '@angular/core';
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
import { ErrorMessageService } from '../../../../core/errors/error-message.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @Input() mode: 'school' | 'guardian' = 'school';

  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly errorMessageService = inject(ErrorMessageService);

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

  protected get isGuardianLogin(): boolean {
    return this.mode === 'guardian';
  }

  protected get loginTitle(): string {
    return this.isGuardianLogin ? 'Acesso do responsável' : 'Acesso ao sistema';
  }

  protected get loginSubtitle(): string {
    return this.isGuardianLogin
      ? 'Entre para acompanhar os acessos do seu aluno.'
      : 'Entre com suas credenciais para continuar.';
  }

  protected get brandSubtitle(): string {
    return this.isGuardianLogin ? 'Portal do responsável' : 'Controle de acesso escolar';
  }

  ngOnInit(): void {
    if (this.isGuardianLogin) {
      this.form.reset({ email: '', password: '' });
    }
    this.auth.prepareCsrfCookie().subscribe({
      error: (error: unknown) => {
        this.errorMessage = this.errorMessageService.getLoginMessage(error);
        this.changeDetector.markForCheck();
      },
    });
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
    this.changeDetector.markForCheck();

    this.auth
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.submitting = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (session) => {
          const destination = session.user.account_type === 'guardian' ? '/responsavel' : '/admin';
          this.router.navigateByUrl(destination);
        },
        error: (error: unknown) => {
          this.errorMessage = this.errorMessageService.getLoginMessage(error);
          this.changeDetector.markForCheck();
        },
      });
  }
}
