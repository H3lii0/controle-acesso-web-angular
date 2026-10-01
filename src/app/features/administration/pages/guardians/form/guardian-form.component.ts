import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { GuardianService } from '../../../../../core/guardians/guardian.service';

@Component({ selector: 'app-guardian-form', imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './guardian-form.component.html', styleUrl: './guardian-form.component.scss' })
export class GuardianFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly guardianService = inject(GuardianService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly form = this.formBuilder.nonNullable.group({
    full_name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: [''],
  });
  protected saving = false;
  protected errorMessage = '';

  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.errorMessage = '';
    const value = this.form.getRawValue();
    this.guardianService.create({ ...value, phone: value.phone.trim() || null }).pipe(
      finalize(() => { this.saving = false; this.changeDetector.markForCheck(); }),
    ).subscribe({
      next: () => this.router.navigate(['/admin/guardians'], { queryParams: { created: '1' } }),
      error: (error) => { this.errorMessage = error?.error?.message || 'Não foi possível cadastrar o responsável.'; this.changeDetector.markForCheck(); },
    });
  }
}
