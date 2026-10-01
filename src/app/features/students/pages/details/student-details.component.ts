import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCheck,
  LucideChevronLeft,
  LucideClock,
  LucideDynamicIcon,
  LucideFingerprint,
  LucideMapPin,
  LucidePencil,
  LucideScanLine,
  LucideUsers,
} from '@lucide/angular';
import { forkJoin } from 'rxjs';
import {
  SchoolClass,
  Student,
  StudentAccessRecord,
} from '../../../../core/students/student.models';
import { StudentService } from '../../../../core/students/student.service';

interface TimelineEvent {
  type: string;
  time: string;
  location: string;
  tone: string;
  timestamp: number;
}
type StudentTab = 'overview' | 'guardian' | 'biometric' | 'accesses';

@Component({
  selector: 'app-student-details',
  imports: [CommonModule, FormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.scss',
})
export class StudentDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly studentsApi = inject(StudentService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly created = this.route.snapshot.queryParamMap.has('created');
  protected readonly icons = {
    back: LucideChevronLeft,
    edit: LucidePencil,
    guardians: LucideUsers,
    biometric: LucideFingerprint,
    accessRecords: LucideScanLine,
    location: LucideMapPin,
    clock: LucideClock,
    check: LucideCheck,
    arrow: LucideArrowRight,
  };
  protected student: Student | null = null;
  protected schoolClasses: SchoolClass[] = [];
  protected events: TimelineEvent[] = [];
  protected loading = true;
  protected editing = false;
  protected saving = false;
  protected errorMessage = '';
  protected feedbackMessage = '';
  protected todayRecord: StudentAccessRecord | null = null;
  protected activeTab: StudentTab = 'overview';
  protected form = { full_name: '', enrollment_number: '', date_of_birth: '', school_class_id: 0 };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      student: this.studentsApi.show(id),
      classes: this.studentsApi.schoolClassOptions(),
    }).subscribe({
      next: ({ student, classes }) => {
        this.student = student.data;
        this.schoolClasses = classes.data;
        this.form = {
          full_name: student.data.full_name,
          enrollment_number: student.data.enrollment_number,
          date_of_birth: student.data.date_of_birth,
          school_class_id: student.data.school_class.id,
        };
        this.loading = false;
        this.loadAccessRecords(student.data);
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os dados do aluno.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  protected toggleEdit(): void {
    if (!this.student) return;
    this.editing = !this.editing;
    this.errorMessage = '';
    this.feedbackMessage = '';
    if (this.editing)
      this.form = {
        full_name: this.student.full_name,
        enrollment_number: this.student.enrollment_number,
        date_of_birth: this.student.date_of_birth,
        school_class_id: this.student.school_class.id,
      };
  }

  protected save(): void {
    if (
      !this.student ||
      !this.form.full_name.trim() ||
      !this.form.enrollment_number.trim() ||
      !this.form.date_of_birth ||
      !this.form.school_class_id ||
      this.saving
    ) {
      this.errorMessage = 'Preencha todos os campos obrigatórios.';
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.feedbackMessage = '';
    this.studentsApi
      .update(this.student.id, {
        student: {
          full_name: this.form.full_name.trim(),
          enrollment_number: this.form.enrollment_number.trim(),
          date_of_birth: this.form.date_of_birth,
          school_class_id: Number(this.form.school_class_id),
        },
        guardian: { mode: 'existing', id: this.student.guardian.id },
      })
      .subscribe({
        next: (response) => {
          this.student = response.data;
          this.editing = false;
          this.saving = false;
          this.feedbackMessage = response.message || 'Dados do aluno atualizados.';
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.errorMessage =
            'Não foi possível atualizar o aluno. Confira matrícula, data e turma.';
          this.saving = false;
          this.changeDetector.markForCheck();
        },
      });
  }

  protected toggleStatus(): void {
    if (!this.student) return;
    const next = !this.student.is_active;
    if (!window.confirm(next ? 'Ativar este aluno?' : 'Desativar este aluno?')) return;
    this.studentsApi.updateStatus(this.student.id, next).subscribe({
      next: (response) => {
        this.student = response.data;
        this.feedbackMessage = response.message || 'Situação atualizada.';
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Não foi possível alterar a situação do aluno.';
        this.changeDetector.markForCheck();
      },
    });
  }

  protected selectTab(tab: StudentTab): void {
    this.activeTab = tab;
    this.editing = false;
    this.errorMessage = '';
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  protected classLabel(item: SchoolClass): string {
    return `${item.name} · ${item.shift === 'morning' ? 'Manhã' : 'Tarde'}`;
  }
  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife' }).format(
      new Date(`${value}T12:00:00`),
    );
  }

  private loadAccessRecords(student: Student): void {
    const now = new Date();
    const today = this.dateInRecife(now);
    const yesterdayDate = new Date(`${today}T12:00:00-03:00`);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = this.dateInRecife(yesterdayDate);
    forkJoin([
      this.studentsApi.accessRecords(today, student.enrollment_number),
      this.studentsApi.accessRecords(yesterday, student.enrollment_number),
    ]).subscribe({
      next: ([todayRecords, yesterdayRecords]) => {
        const records = [...todayRecords.data, ...yesterdayRecords.data].filter(
          (record) => record.student.id === student.id,
        );
        this.todayRecord = records.find((record) => record.access_date === today) ?? null;
        this.events = records
          .flatMap((record) => [
            {
              type: 'Entrada registrada',
              time: this.formatTime(record.entered_at),
              location: 'Escola',
              tone: 'success',
              timestamp: new Date(record.entered_at).getTime(),
            },
            ...(record.exited_at
              ? [
                  {
                    type: 'Saída registrada',
                    time: this.formatTime(record.exited_at),
                    location: 'Escola',
                    tone: 'info',
                    timestamp: new Date(record.exited_at).getTime(),
                  },
                ]
              : []),
          ])
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 4);
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.todayRecord = null;
        this.events = [];
        this.changeDetector.markForCheck();
      },
    });
  }

  private dateInRecife(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Recife',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
  protected formatTime(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Recife',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }
}
