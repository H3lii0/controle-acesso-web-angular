import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon, LucideEye } from '@lucide/angular';
import { Guardian, GuardianStatus } from '../../../../../core/guardians/guardian.models';
import { GuardianService } from '../../../../../core/guardians/guardian.service';

@Component({
  selector: 'app-guardian-list',
  imports: [CommonModule, FormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './guardian-list.component.html',
  styleUrl: './guardian-list.component.scss',
})
export class GuardianListComponent implements OnInit {
  private readonly guardianService = inject(GuardianService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected search = '';
  protected guardians: Guardian[] = [];
  protected loading = true;
  protected errorMessage = '';
  protected currentPage = 1;
  protected lastPage = 1;
  protected total = 0;
  protected readonly icons = { view: LucideEye };

  ngOnInit(): void { this.load(); }

  protected load(page = 1): void {
    this.loading = true;
    this.errorMessage = '';
    this.guardianService.list(this.search, page).subscribe({
      next: (response) => {
        this.guardians = response.data;
        this.currentPage = response.meta.current_page;
        this.lastPage = response.meta.last_page;
        this.total = response.meta.total;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os responsáveis.';
        this.changeDetector.markForCheck();
      },
    });
  }

  protected statusLabel(status: GuardianStatus): string {
    return { pending_activation: 'Pendente', active: 'Ativo', disabled: 'Desativado' }[status];
  }
}
