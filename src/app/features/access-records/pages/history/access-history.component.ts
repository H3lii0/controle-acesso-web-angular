import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideClockAlert,
  LucideDownload,
  LucideDynamicIcon,
  LucideLogIn,
  LucideLogOut,
  LucideRefreshCw,
  LucideSearch,
  LucideShieldX,
} from '@lucide/angular';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, map, of, Subject, Subscription, switchMap } from 'rxjs';
import { AccessRecord, AccessRecordStatus, AccessRecordSummary } from '../../../../core/access-records/access-record.models';
import { AccessRecordService } from '../../../../core/access-records/access-record.service';

@Component({
  selector: 'app-access-history',
  imports: [LucideDynamicIcon],
  templateUrl: './access-history.component.html',
  styleUrl: './access-history.component.scss',
})
export class AccessHistoryComponent {
  private readonly accessRecordService = inject(AccessRecordService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly searchChanges = new Subject<string>();
  private request?: Subscription;

  protected readonly icons = {
    export: LucideDownload,
    refresh: LucideRefreshCw,
    entry: LucideLogIn,
    exit: LucideLogOut,
    delay: LucideClockAlert,
    denied: LucideShieldX,
    search: LucideSearch,
  };

  protected readonly statusOptions: { value: '' | AccessRecordStatus; label: string }[] = [
    { value: '', label: 'Todas as situações' },
    { value: 'inside', label: 'Ainda na escola' },
    { value: 'completed', label: 'Dia concluído' },
  ];

  protected records: AccessRecord[] = [];
  protected summary: AccessRecordSummary = { date: '', entries: 0, exits: 0, inside: 0 };
  protected date = this.todayInRecife();
  protected search = '';
  protected status: '' | AccessRecordStatus = '';
  protected loading = false;
  protected error = '';

  constructor() {
    this.searchChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => {
        this.search = search.trim();
        this.load();
      });

    this.load();
  }

  protected load(): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.error = '';
    const filters = {
      date: this.date,
      search: this.search,
      status: this.status || undefined,
      per_page: 100,
    };

    this.request = forkJoin({
      firstPage: this.accessRecordService.list({ ...filters, page: 1 }),
      summary: this.accessRecordService.summary(filters),
    })
      .pipe(
        switchMap(({ firstPage, summary }) => {
          const remainingPages = Array.from(
            { length: firstPage.meta.last_page - 1 },
            (_, index) => this.accessRecordService.list({ ...filters, page: index + 2 }),
          );

          if (remainingPages.length === 0) {
            return of({ records: firstPage.data, summary: summary.data });
          }

          return forkJoin(remainingPages).pipe(
            map((pages) => ({
              records: [firstPage, ...pages].flatMap((page) => page.data),
              summary: summary.data,
            })),
          );
        }),
        catchError(() => {
          this.error = 'Não foi possível carregar o histórico. Tente novamente.';
          this.changeDetector.markForCheck();
          return of({ records: [], summary: { date: this.date, entries: 0, exits: 0, inside: 0 } });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ records, summary }) => {
        this.records = records;
        this.summary = summary;
        this.loading = false;
        this.changeDetector.markForCheck();
      });
  }

  protected onSearch(value: string): void {
    this.searchChanges.next(value);
  }

  protected onDateChange(value: string): void {
    this.date = value;
    this.load();
  }

  protected onStatusChange(value: string): void {
    this.status = value as '' | AccessRecordStatus;
    this.load();
  }

  protected formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  protected formatTime(timestamp: string | null): string {
    if (!timestamp) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Recife',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  }

  protected get totalReadings(): number {
    return this.summary.entries + this.summary.exits;
  }

  protected exportCsv(): void {
    const rows = [
      ['Data', 'Entrada', 'Saída', 'Aluno', 'Matrícula', 'Turma', 'Situação'],
      ...this.records.map((record) => [
        this.formatDate(record.access_date),
        this.formatTime(record.entered_at),
        this.formatTime(record.exited_at),
        record.student.full_name,
        record.student.enrollment_number,
        record.student.school_class.name,
        record.status === 'inside' ? 'Ainda na escola' : 'Dia concluído',
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico-acessos-${this.date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private todayInRecife(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Recife',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
}
