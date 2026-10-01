import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Guardian } from '../../../../../core/guardians/guardian.models';
import { GuardianService } from '../../../../../core/guardians/guardian.service';

@Component({ selector: 'app-guardian-details', imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './guardian-details.component.html', styleUrl: './guardian-details.component.scss' })
export class GuardianDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly guardianService = inject(GuardianService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected guardian: Guardian | null = null;
  protected loading = true;
  protected saving = false;
  protected resending = false;
  protected errorMessage = '';
  protected feedbackMessage = '';
  protected readonly form = this.formBuilder.nonNullable.group({
    full_name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: [''],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.errorMessage = 'Responsável inválido.'; this.loading = false; return; }
    this.guardianService.show(id).subscribe({
      next: (response) => { this.guardian = response.data; this.form.patchValue({ full_name: this.guardian.full_name, email: this.guardian.email, phone: this.guardian.phone ?? '' }); this.loading = false; this.changeDetector.markForCheck(); },
      error: () => { this.errorMessage = 'Não foi possível carregar o responsável.'; this.loading = false; this.changeDetector.markForCheck(); },
    });
  }

  protected submit(): void {
    if (!this.guardian || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.errorMessage = ''; this.feedbackMessage = '';
    const value = this.form.getRawValue();
    this.guardianService.update(this.guardian.id, { ...value, phone: value.phone.trim() || null }).pipe(
      finalize(() => { this.saving = false; this.changeDetector.markForCheck(); }),
    ).subscribe({
      next: (response) => { this.guardian = response.data; this.feedbackMessage = response.message; this.changeDetector.markForCheck(); },
      error: (error) => { this.errorMessage = error?.error?.message || 'Não foi possível atualizar o responsável.'; this.changeDetector.markForCheck(); },
    });
  }

  protected resendInvitation(): void {
    if (!this.guardian || this.guardian.account_status !== 'pending_activation') return;
    this.resending = true; this.errorMessage = ''; this.feedbackMessage = '';
    this.guardianService.resendInvitation(this.guardian.id).pipe(
      finalize(() => { this.resending = false; this.changeDetector.markForCheck(); }),
    ).subscribe({
      next: (response) => { this.feedbackMessage = response.message; this.changeDetector.markForCheck(); },
      error: (error) => { this.errorMessage = error?.error?.message || 'Não foi possível reenviar o convite.'; this.changeDetector.markForCheck(); },
    });
  }


  protected statusLabel(): string {
    if (!this.guardian) return '';
    return { pending_activation: 'Pendente', active: 'Ativo', disabled: 'Desativado' }[this.guardian.account_status];
  }
}
