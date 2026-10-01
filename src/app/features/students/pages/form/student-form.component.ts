import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideCalendarDays,
  LucideCamera,
  LucideCheck,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideDynamicIcon,
  LucideFingerprint,
  LucideInfo,
  LucideLoaderCircle,
  LucidePencil,
  LucideSearch,
  LucideShieldCheck,
  LucideSchool,
  LucideUserPlus,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { GuardianSummary, SchoolClass } from '../../../../core/students/student.models';
import { StudentService } from '../../../../core/students/student.service';
import { AuthService } from '../../../../core/authentication/auth.service';
import {
  CustomSelectComponent,
  CustomSelectOption,
} from '../../../../shared/components/custom-select/custom-select.component';

type BiometricState = 'ready' | 'reading' | 'captured';
type CalendarDay = { date: string; day: number; currentMonth: boolean };

@Component({
  selector: 'app-student-form',
  imports: [CommonModule, FormsModule, RouterLink, LucideDynamicIcon, CustomSelectComponent],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  private timer?: number;

  protected step = signal(1);
  protected birthDateCalendarOpen = signal(false);
  protected birthDateCalendarView = signal<'days' | 'months' | 'years'>('days');
  protected birthDateCalendarMonth = new Date();
  protected readonly weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  protected biometric = signal<BiometricState>('ready');
  protected loading = signal(true);
  protected saving = signal(false);
  protected errorMessage = signal('');
  protected classOptionsError = signal('');
  protected readonly canManageSchoolClasses =
    this.auth.sessionSnapshot?.user.account_type === 'central_administrator';
  protected schoolClasses = signal<SchoolClass[]>([]);
  protected guardianResults = signal<GuardianSummary[]>([]);
  protected guardianMode: 'new' | 'existing' = 'new';
  protected selectedGuardian: GuardianSummary | null = null;
  protected guardianSearch = '';
  protected readonly icons = {
    check: LucideCheck,
    back: LucideChevronLeft,
    next: LucideChevronRight,
    search: LucideSearch,
    guardian: LucideUserPlus,
    biometric: LucideFingerprint,
    reading: LucideLoaderCircle,
    security: LucideShieldCheck,
    camera: LucideCamera,
    info: LucideInfo,
    edit: LucidePencil,
    calendar: LucideCalendarDays,
    chevron: LucideChevronDown,
    school: LucideSchool,
  };
  protected student = {
    name: '',
    enrollment: '',
    birthDate: '',
    classId: 0,
    className: '',
    shift: '',
    status: 'Ativo',
  };
  protected guardian = { name: '', relationship: '', phone: '', email: '' };
  protected readonly relationshipOptions: CustomSelectOption[] = [
    { value: 'Mãe', label: 'Mãe' },
    { value: 'Pai', label: 'Pai' },
    { value: 'Avó ou avô', label: 'Avó ou avô' },
    { value: 'Outro', label: 'Outro' },
  ];

  ngOnInit(): void {
    this.loadClasses();
  }

  protected loadClasses(): void {
    this.loading.set(true);
    this.classOptionsError.set('');
    this.studentService.schoolClassOptions().subscribe({
      next: (response) => {
        this.schoolClasses.set(response.data);
        if (
          this.student.classId &&
          !response.data.some((schoolClass) => schoolClass.id === this.student.classId)
        )
          this.selectClass(0);
        this.loading.set(false);
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.classOptionsError.set('Não foi possível carregar as turmas. Tente novamente.');
        this.loading.set(false);
        this.changeDetector.markForCheck();
      },
    });
  }

  ngOnDestroy(): void {
    if (this.timer) window.clearTimeout(this.timer);
  }
  protected goTo(step: number): void {
    if (
      step > this.step() &&
      (this.loading() ||
        this.classOptionsError() ||
        !this.schoolClasses().some((schoolClass) => schoolClass.id === this.student.classId))
    ) {
      this.errorMessage.set('Selecione uma turma ativa antes de continuar.');
      return;
    }
    this.errorMessage.set('');
    this.step.set(Math.min(4, Math.max(1, step)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  protected readonly classOptions = (): CustomSelectOption[] =>
    this.schoolClasses().map((schoolClass) => ({
      value: schoolClass.id,
      label: schoolClass.name,
      description: schoolClass.shift === 'morning' ? 'Manhã' : 'Tarde',
    }));

  protected selectClass(id: string | number): void {
    const item = this.schoolClasses().find((schoolClass) => schoolClass.id === Number(id));
    this.student.classId = Number(id);
    this.student.className = item?.name ?? '';
    this.student.shift = item ? (item.shift === 'morning' ? 'Manhã' : 'Tarde') : '';
  }
  protected toggleBirthDateCalendar(): void {
    this.birthDateCalendarView.set('days');
    this.birthDateCalendarOpen.update((open) => !open);
  }
  protected moveBirthDateCalendar(months: number): void {
    this.birthDateCalendarMonth = new Date(
      this.birthDateCalendarMonth.getFullYear(),
      this.birthDateCalendarMonth.getMonth() + months,
      1,
      12,
    );
  }
  protected birthDateCalendarLabel(): string {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
      this.birthDateCalendarMonth,
    );
  }
  protected showBirthDateCalendarView(view: 'months' | 'years'): void {
    this.birthDateCalendarView.set(view);
  }
  protected birthDateCalendarYearOptions(): number[] {
    const year = this.birthDateCalendarMonth.getFullYear();
    return Array.from({ length: 12 }, (_, index) => year - 6 + index);
  }
  protected birthDateCalendarMonthOptions(): { value: number; label: string }[] {
    return Array.from({ length: 12 }, (_, value) => ({
      value,
      label: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
        new Date(2020, value, 1, 12),
      ),
    }));
  }
  protected selectBirthDateCalendarYear(year: number): void {
    this.birthDateCalendarMonth = new Date(year, this.birthDateCalendarMonth.getMonth(), 1, 12);
    this.birthDateCalendarView.set('months');
  }
  protected selectBirthDateCalendarMonth(month: number): void {
    this.birthDateCalendarMonth = new Date(this.birthDateCalendarMonth.getFullYear(), month, 1, 12);
    this.birthDateCalendarView.set('days');
  }
  protected birthDateLabel(): string {
    if (!this.student.birthDate) return 'Selecione a data';
    const [year, month, day] = this.student.birthDate.split('-');
    return `${day}/${month}/${year}`;
  }
  protected birthDateCalendarDays(): CalendarDay[] {
    const year = this.birthDateCalendarMonth.getFullYear();
    const month = this.birthDateCalendarMonth.getMonth();
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
  protected selectBirthDate(value: string): void {
    this.student.birthDate = value;
    this.birthDateCalendarOpen.set(false);
  }
  protected isBirthDateSelected(value: string): boolean {
    return value === this.student.birthDate;
  }
  protected isToday(value: string): boolean {
    return value === this.todayInRecife();
  }
  protected selectTodayBirthDate(): void {
    this.selectBirthDate(this.todayInRecife());
  }
  protected clearBirthDate(): void {
    this.student.birthDate = '';
    this.birthDateCalendarOpen.set(false);
  }
  @HostListener('document:click') protected closePopovers(): void {
    this.birthDateCalendarOpen.set(false);
  }
  protected setGuardianMode(mode: 'new' | 'existing'): void {
    this.guardianMode = mode;
    this.selectedGuardian = null;
    this.guardianResults.set([]);
  }
  protected searchExistingGuardian(): void {
    if (this.guardianSearch.trim().length < 2) return;
    this.studentService.searchGuardians(this.guardianSearch.trim()).subscribe({
      next: (response) => {
        this.guardianResults.set(response.data);
        this.changeDetector.markForCheck();
      },
      error: () => this.errorMessage.set('Não foi possível buscar os responsáveis.'),
    });
  }
  protected chooseGuardian(guardian: GuardianSummary): void {
    this.selectedGuardian = guardian;
    this.guardianSearch = guardian.full_name;
  }
  protected capture(): void {
    this.biometric.set('reading');
    this.timer = window.setTimeout(() => this.biometric.set('captured'), 1800);
  }
  protected complete(): void {
    if (
      this.loading() ||
      this.classOptionsError() ||
      !this.schoolClasses().some((schoolClass) => schoolClass.id === this.student.classId)
    ) {
      this.errorMessage.set('Selecione uma turma ativa antes de concluir o cadastro.');
      this.step.set(1);
      return;
    }
    if (
      !this.student.classId ||
      !this.student.name ||
      !this.student.enrollment ||
      !this.student.birthDate ||
      this.biometric() !== 'captured' ||
      (this.guardianMode === 'existing' && !this.selectedGuardian) ||
      (this.guardianMode === 'new' && (!this.guardian.name || !this.guardian.email))
    ) {
      this.errorMessage.set(
        this.biometric() !== 'captured'
          ? 'Conclua a captura biométrica simulada antes de finalizar.'
          : 'Complete os dados obrigatórios antes de concluir.',
      );
      return;
    }
    this.saving.set(true);
    this.errorMessage.set('');
    const guardian =
      this.guardianMode === 'existing'
        ? { mode: 'existing' as const, id: this.selectedGuardian!.id }
        : {
            mode: 'new' as const,
            full_name: this.guardian.name,
            email: this.guardian.email,
            phone: this.guardian.phone.trim() || null,
          };
    this.studentService
      .create({
        student: {
          enrollment_number: this.student.enrollment,
          full_name: this.student.name,
          date_of_birth: this.student.birthDate,
          school_class_id: this.student.classId,
          biometric_captured: true,
        },
        guardian,
      })
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (response) =>
          this.router.navigate(['/admin/students', response.data.id], {
            queryParams: { created: '1' },
          }),
        error: () => {
          this.errorMessage.set(
            'Não foi possível cadastrar o aluno. Verifique os dados informados.',
          );
          this.changeDetector.markForCheck();
        },
      });
  }

  private toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
}
