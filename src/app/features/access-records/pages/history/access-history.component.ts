import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideCalendarDays,
  LucideClockAlert,
  LucideDownload,
  LucideDynamicIcon,
  LucideLogIn,
  LucideLogOut,
  LucideRefreshCw,
  LucideSearch,
  LucideSchool,
  LucideShieldX,
} from '@lucide/angular';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import {
  AccessRecord,
  AccessRecordStatus,
  AccessRecordSummary,
} from '../../../../core/access-records/access-record.models';
import { AccessRecordService } from '../../../../core/access-records/access-record.service';
import {
  CustomSelectComponent,
  CustomSelectOption,
} from '../../../../shared/components/custom-select/custom-select.component';

type DatePickerField = 'from' | 'to';
type CalendarDay = { date: string; day: number; currentMonth: boolean };

@Component({
  selector: 'app-access-history',
  imports: [LucideDynamicIcon, CustomSelectComponent],
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
    calendar: LucideCalendarDays,
    export: LucideDownload,
    refresh: LucideRefreshCw,
    entry: LucideLogIn,
    exit: LucideLogOut,
    delay: LucideClockAlert,
    denied: LucideShieldX,
    search: LucideSearch,
    school: LucideSchool,
  };

  protected readonly statusOptions: CustomSelectOption[] = [
    { value: '', label: 'Todas as situações' },
    { value: 'inside', label: 'Ainda na escola' },
    { value: 'completed', label: 'Dia concluído' },
  ];

  protected records: AccessRecord[] = [];
  protected summary: AccessRecordSummary = {
    date: '',
    classes: [],
    entries: 0,
    exits: 0,
    inside: 0,
  };
  protected dateFrom = this.todayInRecife();
  protected dateTo = this.dateFrom;
  protected search = '';
  protected schoolClassId = '';
  protected status: '' | AccessRecordStatus = '';
  protected readonly openDatePicker = signal<DatePickerField | null>(null);
  protected readonly calendarView = signal<'days' | 'months' | 'years'>('days');
  protected calendarMonth = new Date(`${this.dateFrom}T12:00:00`);
  protected readonly weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
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
      date_from: this.dateFrom,
      date_to: this.dateTo,
      search: this.search,
      school_class_id: this.schoolClassId ? Number(this.schoolClassId) : undefined,
      status: this.status || undefined,
      per_page: 100,
    };

    const firstPage$ = this.accessRecordService.list({ ...filters, page: 1 }).pipe(
      switchMap((firstPage) => {
        const remainingPages = Array.from({ length: firstPage.meta.last_page - 1 }, (_, index) =>
          this.accessRecordService.list({ ...filters, page: index + 2 }),
        );

        return remainingPages.length === 0
          ? of(firstPage.data)
          : forkJoin(remainingPages).pipe(
              map((pages) => [firstPage, ...pages].flatMap((page) => page.data)),
            );
      }),
      catchError(() => {
        this.error = 'Não foi possível carregar o histórico. Tente novamente.';
        this.loading = false;
        this.changeDetector.markForCheck();
        return of([] as AccessRecord[]);
      }),
      takeUntilDestroyed(this.destroyRef),
    );
    const summary$ = this.accessRecordService.summary(filters).pipe(
      catchError(() => {
        this.error = 'Não foi possível carregar os indicadores. Tente novamente.';
        this.loading = false;
        this.changeDetector.markForCheck();
        return of({ data: { date: this.dateFrom, classes: [], entries: 0, exits: 0, inside: 0 } });
      }),
      takeUntilDestroyed(this.destroyRef),
    );

    // Render each response independently so the table does not wait for the KPI summary.
    this.request = new Subscription();
    this.request.add(
      firstPage$.subscribe((records) => {
        this.records = records;
        this.changeDetector.markForCheck();
      }),
    );
    this.request.add(
      summary$.subscribe((response) => {
        this.summary = response.data;
        this.loading = false;
        this.changeDetector.markForCheck();
      }),
    );
  }

  protected onSearch(value: string): void {
    this.searchChanges.next(value);
  }

  protected onDateFromChange(value: string): void {
    this.dateFrom = value;
    this.loadDateRange();
  }

  protected onDateToChange(value: string): void {
    this.dateTo = value;
    this.loadDateRange();
  }

  protected toggleDatePicker(field: DatePickerField): void {
    this.calendarView.set('days');
    this.openDatePicker.update((current) => (current === field ? null : field));
  }

  protected selectDate(field: DatePickerField, value: string): void {
    if (field === 'from') this.dateFrom = value;
    else this.dateTo = value;
    this.openDatePicker.set(null);
    this.loadDateRange();
  }

  protected moveCalendar(months: number): void {
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear(),
      this.calendarMonth.getMonth() + months,
      1,
      12,
    );
  }

  protected showCalendarView(view: 'months' | 'years'): void {
    this.calendarView.set(view);
  }
  protected calendarYearOptions(): number[] {
    const year = this.calendarMonth.getFullYear();
    return Array.from({ length: 12 }, (_, index) => year - 6 + index);
  }
  protected calendarMonthOptions(): { value: number; label: string }[] {
    return Array.from({ length: 12 }, (_, value) => ({
      value,
      label: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
        new Date(2020, value, 1, 12),
      ),
    }));
  }
  protected selectCalendarYear(year: number): void {
    this.calendarMonth = new Date(year, this.calendarMonth.getMonth(), 1, 12);
    this.calendarView.set('months');
  }
  protected selectCalendarMonth(month: number): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), month, 1, 12);
    this.calendarView.set('days');
  }

  protected calendarMonthLabel(): string {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
      this.calendarMonth,
    );
  }

  protected calendarDays(): CalendarDay[] {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1, 12);
    const start = new Date(year, month, 1 - firstDay.getDay(), 12);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index, 12);
      return {
        date: this.toIsoDate(date),
        day: date.getDate(),
        currentMonth: date.getMonth() === month,
      };
    });
  }

  protected isSelectedDate(value: string): boolean {
    return value === this.dateFrom || value === this.dateTo;
  }
  protected isToday(value: string): boolean {
    return value === this.todayInRecife();
  }
  protected clearDate(field: DatePickerField): void {
    this.selectDate(field, '');
  }
  protected selectToday(field: DatePickerField): void {
    this.selectDate(field, this.todayInRecife());
  }

  protected onStatusChange(value: string): void {
    this.status = value as '' | AccessRecordStatus;
    this.load();
  }

  protected classOptions(): CustomSelectOption[] {
    return [
      { value: '', label: 'Todas as turmas' },
      ...this.summary.classes.map((schoolClass) => ({
        value: schoolClass.id,
        label: schoolClass.name,
      })),
    ];
  }

  protected selectClass(value: string | number): void {
    this.schoolClassId = String(value);
    this.load();
  }

  protected selectStatus(value: string | number): void {
    this.status = value as '' | AccessRecordStatus;
    this.load();
  }
  @HostListener('document:click')
  protected closeDatePicker(): void {
    this.openDatePicker.set(null);
  }

  protected onClassChange(value: string): void {
    this.schoolClassId = value;
    this.load();
  }

  protected get dateRangeError(): string {
    return this.dateFrom && this.dateTo && this.dateTo < this.dateFrom
      ? 'A data final deve ser igual ou posterior à data inicial.'
      : '';
  }

  private loadDateRange(): void {
    if (this.dateRangeError) {
      this.records = [];
      this.summary = { date: this.dateFrom, classes: [], entries: 0, exits: 0, inside: 0 };
      this.changeDetector.markForCheck();
      return;
    }
    this.load();
  }

  protected formatDate(date: string): string {
    if (!date) return '—';
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
    const csv = rows
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(';'))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico-acessos-${this.dateFrom}-${this.dateTo}.csv`;
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
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }

  private toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  protected formatPeriod(): string {
    return this.dateFrom === this.dateTo
      ? this.formatDate(this.dateFrom)
      : `${this.formatDate(this.dateFrom)} a ${this.formatDate(this.dateTo)}`;
  }
}
