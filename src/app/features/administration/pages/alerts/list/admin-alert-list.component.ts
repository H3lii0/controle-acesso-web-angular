import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { LucideAlertTriangle, LucideCheckCircle2, LucideDynamicIcon, LucideShieldX } from '@lucide/angular';
import { finalize } from 'rxjs';
import { AdminAlert, AdminAlertType } from '../../../../../core/admin-alerts/admin-alert.models';
import { AdminAlertService } from '../../../../../core/admin-alerts/admin-alert.service';
import { LoadingSkeletonComponent } from '../../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { CustomSelectComponent, CustomSelectOption } from '../../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-admin-alert-list',
  imports: [LucideDynamicIcon, DatePipe, LoadingSkeletonComponent, CustomSelectComponent],
  templateUrl: './admin-alert-list.component.html',
  styleUrl: './admin-alert-list.component.scss',
})
export class AdminAlertListComponent {
  private readonly service = inject(AdminAlertService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  protected readonly icons = {
    success: LucideCheckCircle2,
    denied: LucideShieldX,
    alert: LucideAlertTriangle,
  };
  protected readonly typeOptions: CustomSelectOption[] = [
    { value: 'all', label: 'Todos os eventos' },
    { value: 'success', label: 'Acessos autorizados' },
    { value: 'denied', label: 'Acessos negados' },
  ];
  protected alerts: AdminAlert[] = [];
  protected selectedType: AdminAlertType = 'all';
  protected loading = true;
  protected error = '';

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading = true;
    this.error = '';
    this.service.list(this.selectedType).pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetector.markForCheck();
      }),
    ).subscribe({
      next: (response) => {
        this.alerts = response.data;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'Não foi possível carregar os alertas.';
        this.changeDetector.markForCheck();
      },
    });
  }

  protected selectType(value: string | number): void {
    this.selectedType = value as AdminAlertType;
    this.load();
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Recife',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }
}
