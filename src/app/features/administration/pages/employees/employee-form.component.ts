import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../../core/administration/employee.service';
import { Permission } from '../../../../core/administration/administration.models';

@Component({
  selector: 'app-employee-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.nonNullable.group({
    full_name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: [''],
    permissions: this.formBuilder.nonNullable.control<string[]>([], Validators.minLength(1)),
  });
  protected permissions: Permission[] = [];
  protected loading = true;
  protected saving = false;
  protected errorMessage = '';

  ngOnInit(): void {
    this.employeeService.permissions().subscribe({
      next: (response) => { this.permissions = response.data; this.loading = false; },
      error: () => { this.errorMessage = 'Não foi possível carregar as permissões.'; this.loading = false; },
    });
  }

  protected togglePermission(key: string): void {
    const current = this.form.controls.permissions.value;
    this.form.controls.permissions.setValue(current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
    this.form.controls.permissions.markAsTouched();
  }

  protected hasPermission(key: string): boolean {
    return this.form.controls.permissions.value.includes(key);
  }

  protected submit(): void {
    if (this.form.invalid || this.saving) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.errorMessage = '';
    const value = this.form.getRawValue();
    this.employeeService.create({ ...value, phone: value.phone.trim() || null }).subscribe({
      next: () => this.router.navigateByUrl('/admin/employees'),
      error: () => { this.errorMessage = 'Não foi possível cadastrar o funcionário. Verifique os dados informados.'; this.saving = false; },
    });
  }
}
