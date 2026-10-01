import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideDynamicIcon,
  LucidePencil,
  LucidePlus,
  LucidePower,
  LucideRefreshCw,
  LucideSearch,
  LucideX,
} from '@lucide/angular';
import { Subscription, debounceTime, distinctUntilChanged, finalize, startWith } from 'rxjs';
import { SchoolClass, SchoolShift } from '../../../../core/school-classes/school-class.models';
import { SchoolClassService } from '../../../../core/school-classes/school-class.service';

@Component({
  selector: 'app-school-class-list',
  imports: [ReactiveFormsModule, LucideDynamicIcon],
  templateUrl: './school-class-list.component.html',
  styleUrl: './school-class-list.component.scss',
})
export class SchoolClassListComponent implements OnInit {
  private readonly api = inject(SchoolClassService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private listRequest?: Subscription;

  @ViewChild('classDialog', { static: true }) private classDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('statusDialog', { static: true }) private statusDialog!: ElementRef<HTMLDialogElement>;

  protected readonly icons = {
    add: LucidePlus,
    search: LucideSearch,
    edit: LucidePencil,
    power: LucidePower,
    refresh: LucideRefreshCw,
    close: LucideX,
    previous: LucideChevronLeft,
    next: LucideChevronRight,
  };
  protected readonly filters = this.formBuilder.nonNullable.group({
    search: [''],
    shift: ['' as SchoolShift | ''],
    status: [''],
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    shift: ['morning' as SchoolShift, Validators.required],
  });
  protected readonly schoolClasses = signal<SchoolClass[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');
  protected readonly currentPage = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly total = signal(0);
  protected readonly editingClass = signal<SchoolClass | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');
  protected readonly fieldErrors = signal<Record<string, string[]>>({});
  protected readonly statusTarget = signal<SchoolClass | null>(null);
  protected readonly changingStatus = signal(false);
  protected readonly statusError = signal('');

  ngOnInit(): void {
    this.filters.valueChanges
      .pipe(
        startWith(this.filters.getRawValue()),
        debounceTime(250),
        distinctUntilChanged(
          (previous, current) =>
            previous.search === current.search &&
            previous.shift === current.shift &&
            previous.status === current.status,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.load(1));
  }

  protected load(page = this.currentPage()): void {
    this.listRequest?.unsubscribe();
    this.loading.set(true);
    this.errorMessage.set('');
    const filters = this.filters.getRawValue();
    this.listRequest = this.api
      .list({
        search: filters.search.trim() || undefined,
        shift: filters.shift || undefined,
        is_active: filters.status ? filters.status === 'active' : undefined,
        page,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (response.meta.current_page > response.meta.last_page) {
            this.load(response.meta.last_page);
            return;
          }
          this.schoolClasses.set(response.data);
          this.currentPage.set(response.meta.current_page);
          this.lastPage.set(response.meta.last_page);
          this.total.set(response.meta.total);
        },
        error: () => this.errorMessage.set('Não foi possível carregar as turmas. Tente novamente.'),
      });
  }

  protected changePage(page: number): void {
    if (page >= 1 && page <= this.lastPage() && page !== this.currentPage()) this.load(page);
  }

  protected openForm(schoolClass: SchoolClass | null = null): void {
    this.editingClass.set(schoolClass);
    this.form.reset({ name: schoolClass?.name ?? '', shift: schoolClass?.shift ?? 'morning' });
    this.formError.set('');
    this.fieldErrors.set({});
    this.classDialog.nativeElement.showModal();
  }

  protected closeForm(): void {
    if (!this.saving()) this.classDialog.nativeElement.close();
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.formError.set('');
    this.fieldErrors.set({});
    const payload = { ...this.form.getRawValue(), name: this.form.controls.name.value.trim() };
    const editingClass = this.editingClass();
    const request = editingClass
      ? this.api.update(editingClass.id, payload)
      : this.api.create(payload);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.notice.set(response.message);
          this.classDialog.nativeElement.close();
          this.load(editingClass ? this.currentPage() : 1);
        },
        error: (error: HttpErrorResponse) => {
          this.fieldErrors.set(error.status === 422 ? (error.error?.errors ?? {}) : {});
          this.formError.set(
            error.status === 422
              ? 'Confira os campos informados.'
              : 'Não foi possível salvar a turma. Tente novamente.',
          );
        },
      });
  }

  protected fieldError(field: 'name' | 'shift'): string {
    const apiError = this.fieldErrors()[field]?.[0];
    if (apiError) return apiError;
    const control = this.form.controls[field];
    if (!control.touched || !control.invalid) return '';
    if (control.hasError('maxlength')) return 'O nome deve ter no máximo 100 caracteres.';
    return field === 'name' ? 'Informe o nome da turma.' : 'Selecione o turno.';
  }

  protected openStatus(schoolClass: SchoolClass): void {
    this.statusTarget.set(schoolClass);
    this.statusError.set('');
    this.statusDialog.nativeElement.showModal();
  }

  protected closeStatus(): void {
    if (!this.changingStatus()) this.statusDialog.nativeElement.close();
  }

  protected confirmStatus(): void {
    const schoolClass = this.statusTarget();
    if (!schoolClass || this.changingStatus()) return;
    this.changingStatus.set(true);
    this.statusError.set('');
    this.api
      .updateStatus(schoolClass.id, !schoolClass.is_active)
      .pipe(
        finalize(() => this.changingStatus.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.notice.set(response.message);
          this.statusDialog.nativeElement.close();
          this.load();
        },
        error: () =>
          this.statusError.set('Não foi possível alterar a situação da turma. Tente novamente.'),
      });
  }

  protected onCancel(event: Event, busy: boolean): void {
    if (busy) event.preventDefault();
  }

  protected shiftLabel(shift: SchoolShift): string {
    return shift === 'morning' ? 'Manhã' : 'Tarde';
  }
}
