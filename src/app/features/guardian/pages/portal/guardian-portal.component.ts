import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideBell,
  LucideCalendarDays,
  LucideChevronDown,
  LucideCircleCheck,
  LucideClock3,
  LucideDynamicIcon,
  LucideHistory,
  LucideHouse,
  LucideLogOut,
  LucideSchool,
  LucideShieldCheck,
  LucideUserRound,
} from '@lucide/angular';
import { AuthService } from '../../../../core/authentication/auth.service';
import { StudentService } from '../../../../core/students/student.service';
import { GuardianStudent, StudentAccessRecord } from '../../../../core/students/student.models';

type PortalView = 'home' | 'history';
type PortalEvent = {
  day: string;
  time: string;
  timestamp: string;
  type: string;
  location: string;
  variant: 'entry' | 'exit';
};

@Component({
  selector: 'app-guardian-portal',
  imports: [LucideDynamicIcon],
  templateUrl: './guardian-portal.component.html',
  styleUrl: './guardian-portal.component.scss',
})
export class GuardianPortalComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);

  protected readonly view = signal<PortalView>('home');
  protected readonly currentSchoolName = 'Colégio Horizonte';
  protected readonly icons = {
    school: LucideSchool,
    bell: LucideBell,
    signOut: LucideLogOut,
    home: LucideHouse,
    history: LucideHistory,
    profile: LucideUserRound,
    calendar: LucideCalendarDays,
    clock: LucideClock3,
    confirmed: LucideCircleCheck,
    protected: LucideShieldCheck,
    expand: LucideChevronDown,
  };

  protected students: GuardianStudent[] = [];
  protected selectedStudent: GuardianStudent | null = null;
  protected events: PortalEvent[] = [];
  protected records: StudentAccessRecord[] = [];
  protected loading = true;
  protected recordsLoading = false;
  protected errorMessage = '';
  protected recordsErrorMessage = '';
  protected readonly periodLabel = this.formatCurrentMonth();

  ngOnInit(): void {
    this.loadStudents();
  }

  protected get guardianName(): string {
    return this.auth.sessionSnapshot?.user.full_name?.split(' ')[0] ?? 'responsável';
  }

  protected get studentInitials(): string {
    return this.initials(this.selectedStudent?.full_name ?? '');
  }

  protected get studentPeriod(): string {
    if (!this.selectedStudent) return 'Sem turma vinculada';
    const shift = this.selectedStudent.school_class.shift === 'morning' ? 'Manhã' : 'Tarde';
    return `${this.selectedStudent.school_class.name} · ${shift}`;
  }

  protected get todayRecord(): StudentAccessRecord | null {
    const today = this.dateInRecife(new Date());
    return this.records.find((record) => record.access_date === today) ?? null;
  }

  protected get currentStatus(): string {
    const record = this.todayRecord;
    if (!record) return 'Sem registro de acesso hoje';
    return record.exited_at ? 'Acesso concluído hoje' : 'Está na escola';
  }

  protected get lastEventLabel(): string {
    const record = this.todayRecord;
    if (!record) return 'Nenhum registro hoje';
    if (record.exited_at) return `Saída às ${this.formatTime(record.exited_at)}`;
    return `Entrada às ${this.formatTime(record.entered_at)}`;
  }

  protected get lastEventLocation(): string {
    return this.todayRecord ? 'Leitura biométrica' : 'Acompanhe os próximos registros';
  }

  protected get entryCount(): number {
    return this.records.length;
  }

  protected get exitCount(): number {
    return this.records.filter((record) => record.exited_at !== null).length;
  }

  protected get recordDays(): number {
    return new Set(this.records.map((record) => record.access_date)).size;
  }

  protected open(view: PortalView): void {
    this.view.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected selectNextStudent(): void {
    if (this.students.length < 2 || !this.selectedStudent) return;
    const currentIndex = this.students.findIndex((student) => student.id === this.selectedStudent?.id);
    const nextIndex = (currentIndex + 1) % this.students.length;
    this.selectedStudent = this.students[nextIndex];
    this.loadAccessRecords();
  }

  protected signOut(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }

  private loadStudents(): void {
    this.loading = true;
    this.errorMessage = '';
    this.studentService.guardianStudents().subscribe({
      next: (response) => {
        this.students = response.data;
        this.selectedStudent = this.students[0] ?? null;
        this.loading = false;
        if (this.selectedStudent) this.loadAccessRecords();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os alunos vinculados.';
      },
    });
  }

  private loadAccessRecords(): void {
    if (!this.selectedStudent) return;
    this.recordsLoading = true;
    this.recordsErrorMessage = '';
    this.studentService
      .guardianAccessRecords(this.selectedStudent.id, this.monthStart(), this.dateInRecife(new Date()))
      .subscribe({
        next: (response) => {
          this.records = response.data;
          this.events = this.toEvents(this.records);
          this.recordsLoading = false;
        },
        error: () => {
          this.records = [];
          this.events = [];
          this.recordsLoading = false;
          this.recordsErrorMessage = 'Não foi possível carregar o histórico de acessos.';
        },
      });
  }

  private toEvents(records: StudentAccessRecord[]): PortalEvent[] {
    return records
      .flatMap((record) => {
        const events: PortalEvent[] = [
          {
            day: this.formatDay(record.access_date),
            time: this.formatTime(record.entered_at),
            timestamp: record.entered_at,
            type: 'Entrada registrada',
            location: 'Leitura biométrica',
            variant: 'entry',
          },
        ];
        if (record.exited_at) {
          events.push({
            day: this.formatDay(record.access_date),
            time: this.formatTime(record.exited_at),
            timestamp: record.exited_at,
            type: 'Saída registrada',
            location: 'Leitura biométrica',
            variant: 'exit',
          });
        }
        return events;
      })
      .sort((first, second) => second.timestamp.localeCompare(first.timestamp));
  }

  private formatTime(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Recife',
    }).format(new Date(value));
  }

  private formatDay(value: string): string {
    const today = this.dateInRecife(new Date());
    if (value === today) return 'Hoje';
    const yesterday = new Date(`${today}T12:00:00-03:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    if (value === this.dateInRecife(yesterday)) return 'Ontem';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      timeZone: 'America/Recife',
    })
      .format(new Date(`${value}T12:00:00-03:00`))
      .replace('.', '');
  }

  private formatCurrentMonth(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Recife',
    }).format(new Date());
  }

  private monthStart(): string {
    const today = this.dateInRecife(new Date());
    return `${today.slice(0, 8)}01`;
  }

  private dateInRecife(value: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Recife',
    }).format(value);
  }

  private initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
