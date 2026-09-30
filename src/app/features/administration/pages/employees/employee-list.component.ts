import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs';
import { Employee, EmployeeStatus } from '../../../../core/administration/administration.models';
import { EmployeeService } from '../../../../core/administration/employee.service';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  protected readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    status: ['' as EmployeeStatus | ''],
  });
  protected employees: Employee[] = [];
  protected loading = true;
  protected errorMessage = '';
  protected currentPage = 1;
  protected lastPage = 1;
  protected total = 0;

  ngOnInit(): void {
    this.filters.valueChanges.pipe(
      startWith(this.filters.getRawValue()),
      debounceTime(250),
      distinctUntilChanged((previous, current) => previous.search === current.search && previous.status === current.status),
      switchMap((filters) => {
        this.loading = true;
        this.errorMessage = '';
        return this.employeeService.list({ ...filters, page: 1, per_page: 15 }).pipe(finalize(() => { this.loading = false; this.changeDetector.markForCheck(); }));
      }),
    ).subscribe({
      next: (response) => this.applyResponse(response),
      error: () => { this.errorMessage = 'Não foi possível carregar os funcionários.'; this.changeDetector.markForCheck(); },
    });
  }

  protected changePage(page: number): void {
    if (page < 1 || page > this.lastPage || page === this.currentPage) return;
    this.loading = true;
    this.employeeService.list({ ...this.filters.getRawValue(), page, per_page: 15 }).pipe(
      finalize(() => { this.loading = false; this.changeDetector.markForCheck(); }),
    ).subscribe({
      next: (response) => this.applyResponse(response),
      error: () => { this.errorMessage = 'Não foi possível carregar os funcionários.'; this.changeDetector.markForCheck(); },
    });
  }

  protected statusLabel(status: EmployeeStatus): string {
    return { pending_activation: 'Pendente', active: 'Ativo', disabled: 'Desativado' }[status];
  }

  private applyResponse(response: { data: Employee[]; meta: { current_page: number; last_page: number; total: number } }): void {
    this.employees = response.data;
    this.currentPage = response.meta.current_page;
    this.lastPage = response.meta.last_page;
    this.total = response.meta.total;
    this.changeDetector.markForCheck();
  }
}
