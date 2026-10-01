import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Employee, Permission } from '../../../../../core/administration/administration.models';
import { EmployeeService } from '../../../../../core/administration/employee.service';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss',
})
export class EmployeeDetailsComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected employee: Employee | null = null;
  protected permissions: Permission[] = [];
  protected loading = true;
  protected saving = false;
  protected errorMessage = '';
  protected feedbackMessage = '';
  protected readonly form = this.formBuilder.nonNullable.group({
    full_name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: [''],
    permissions: this.formBuilder.nonNullable.control<string[]>([], Validators.minLength(1)),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.employeeService.show(id).subscribe({
      next: (response) => {
        this.employee = response.data;
        this.form.patchValue({
          full_name: response.data.full_name,
          email: response.data.email,
          phone: response.data.phone ?? '',
          permissions: response.data.permissions.map((item) => item.key),
        });
        this.changeDetector.markForCheck();
        this.loadPermissions();
      },
      error: () => {
        this.errorMessage = 'Funcionário não encontrado.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  protected togglePermission(key: string): void {
    const current = this.form.controls.permissions.value;
    this.form.controls.permissions.setValue(
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  protected hasPermission(key: string): boolean {
    return this.form.controls.permissions.value.includes(key);
  }

  protected save(): void {
    if (!this.employee || this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.feedbackMessage = '';
    this.errorMessage = '';
    const value = this.form.getRawValue();
    this.employeeService
      .update(this.employee.id, { ...value, phone: value.phone.trim() || null })
      .subscribe({
        next: (response) => {
          this.employee = response.data;
          this.feedbackMessage = response.message;
          this.saving = false;
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Não foi possível atualizar o funcionário.';
          this.saving = false;
          this.changeDetector.markForCheck();
        },
      });
  }

  protected changeStatus(): void {
    if (!this.employee) return;
    const status = this.employee.account_status === 'disabled' ? 'active' : 'disabled';
    if (
      !window.confirm(
        status === 'disabled' ? 'Desativar este funcionário?' : 'Reativar este funcionário?',
      )
    )
      return;
    this.employeeService.updateStatus(this.employee.id, status).subscribe({
      next: (response) => {
        this.employee = response.data;
        this.feedbackMessage = response.message;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Não foi possível alterar a situação da conta.';
        this.changeDetector.markForCheck();
      },
    });
  }

  protected resendInvitation(): void {
    if (!this.employee || !window.confirm('Reenviar o convite de ativação?')) return;
    this.employeeService.resendInvitation(this.employee.id).subscribe({
      next: (response) => {
        this.feedbackMessage = response.message;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Não foi possível reenviar o convite.';
        this.changeDetector.markForCheck();
      },
    });
  }

  private loadPermissions(): void {
    this.employeeService.permissions().subscribe({
      next: (response) => {
        this.permissions = response.data;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar as permissões.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
