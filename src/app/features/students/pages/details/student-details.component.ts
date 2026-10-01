import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
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
  LucideX,
} from '@lucide/angular';
import { forkJoin } from 'rxjs';
import {
  GuardianSummary,
  SchoolClass,
  Student,
  StudentAccessRecord,
} from '../../../../core/students/student.models';
import { StudentService } from '../../../../core/students/student.service';
import {
  CustomSelectComponent,
  CustomSelectOption,
} from '../../../../shared/components/custom-select/custom-select.component';

interface TimelineEvent {
  type: string;
  time: string;
  location: string;
  tone: string;
  timestamp: number;
}
type StudentTab = 'overview' | 'guardian' | 'biometric' | 'accesses';
type BiometricCaptureState = 'ready' | 'reading' | 'captured' | 'error';

@Component({
  selector: 'app-student-details',
  imports: [CommonModule, FormsModule, RouterLink, LucideDynamicIcon, CustomSelectComponent],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.scss',
})
export class StudentDetailsComponent implements OnInit, OnDestroy {
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
    reading: LucideScanLine,
    close: LucideX,
  };
  protected student: Student | null = null;
  protected schoolClasses: SchoolClass[] = [];
  protected events: TimelineEvent[] = [];
  protected loading = true;
  protected editing = false;
  protected saving = false;
  protected capturingBiometric = false;
  protected biometricModalOpen = false;
  protected biometricCaptureState: BiometricCaptureState = 'ready';
  protected biometricModalError = '';
  private biometricTimer?: number;
  protected errorMessage = '';
  protected feedbackMessage = '';
  protected todayRecord: StudentAccessRecord | null = null;
  protected activeTab: StudentTab = 'overview';
  protected form = { full_name: '', enrollment_number: '', date_of_birth: '', school_class_id: 0 };
  protected guardianSearch = '';
  protected guardianResults: GuardianSummary[] = [];
  protected selectedGuardianId = 0;

  protected classOptions(): CustomSelectOption[] {
    const options = this.schoolClasses.map((schoolClass) => ({
      value: schoolClass.id,
      label: this.classLabel(schoolClass),
    }));

    if (
      this.student &&
      !this.schoolClasses.some((schoolClass) => schoolClass.id === this.student?.school_class.id)
    ) {
      options.unshift({
        value: this.student.school_class.id,
        label: `${this.classLabel(this.student.school_class)} · turma inativa atual`,
      });
    }

    return options;
  }

  protected selectClass(value: string | number): void {
    this.form.school_class_id = Number(value);
  }

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
        this.selectedGuardianId = student.data.guardian.id;
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

  ngOnDestroy(): void {
    if (this.biometricTimer) window.clearTimeout(this.biometricTimer);
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
    this.selectedGuardianId = this.student.guardian.id;
    this.guardianSearch = this.student.guardian.full_name;
    this.guardianResults = [];
  }

  protected save(): void {
    if (
      !this.student ||
      !this.form.full_name.trim() ||
      !this.form.enrollment_number.trim() ||
      !this.form.date_of_birth ||
      !this.form.school_class_id ||
      !this.selectedGuardianId ||
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
        guardian: { mode: 'existing', id: this.selectedGuardianId },
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

  protected searchExistingGuardian(): void {
    if (this.guardianSearch.trim().length < 2) {
      this.guardianResults = [];
      return;
    }
    this.studentsApi.searchGuardians(this.guardianSearch.trim()).subscribe({
      next: (response) => {
        this.guardianResults = response.data;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Não foi possível buscar os responsáveis.';
        this.changeDetector.markForCheck();
      },
    });
  }

  protected chooseGuardian(guardian: GuardianSummary): void {
    this.selectedGuardianId = guardian.id;
    this.guardianSearch = guardian.full_name;
    this.guardianResults = [];
  }

  protected captureBiometric(): void {
    if (!this.student || this.capturingBiometric) return;
    this.biometricModalOpen = true;
    this.biometricCaptureState = 'ready';
    this.biometricModalError = '';
  }

  protected startBiometricCapture(): void {
    if (!this.student || this.capturingBiometric || this.biometricCaptureState === 'reading')
      return;
    this.capturingBiometric = true;
    this.biometricCaptureState = 'reading';
    this.biometricModalError = '';
    this.biometricTimer = window.setTimeout(() => this.completeBiometricCapture(), 1800);
  }

  protected closeBiometricModal(): void {
    if (this.capturingBiometric) return;
    this.biometricModalOpen = false;
    this.biometricModalError = '';
  }

  private completeBiometricCapture(): void {
    if (!this.student) return;
    this.studentsApi.captureBiometric(this.student.id).subscribe({
      next: (response) => {
        this.student = response.data;
        this.capturingBiometric = false;
        this.biometricCaptureState = 'captured';
        this.feedbackMessage = response.message;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.capturingBiometric = false;
        this.biometricCaptureState = 'error';
        this.biometricModalError = 'Não foi possível concluir a captura. Tente novamente.';
        this.changeDetector.markForCheck();
      },
    });
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
