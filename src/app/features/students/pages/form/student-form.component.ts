import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCamera, LucideCheck, LucideChevronLeft, LucideChevronRight, LucideDynamicIcon, LucideFingerprint, LucideInfo, LucideLoaderCircle, LucidePencil, LucideSearch, LucideShieldCheck, LucideUserPlus } from '@lucide/angular';
import { finalize } from 'rxjs';
import { GuardianSummary, SchoolClass } from '../../../../core/students/student.models';
import { StudentService } from '../../../../core/students/student.service';

type BiometricState = 'ready' | 'reading' | 'captured';

@Component({
  selector: 'app-student-form',
  imports: [CommonModule, FormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private timer?: number;

  protected step = signal(1);
  protected biometric = signal<BiometricState>('ready');
  protected loading = signal(true);
  protected saving = signal(false);
  protected errorMessage = signal('');
  protected schoolClasses = signal<SchoolClass[]>([]);
  protected guardianResults = signal<GuardianSummary[]>([]);
  protected guardianMode: 'new' | 'existing' = 'new';
  protected selectedGuardian: GuardianSummary | null = null;
  protected guardianSearch = '';
  protected readonly icons = { check: LucideCheck, back: LucideChevronLeft, next: LucideChevronRight, search: LucideSearch, guardian: LucideUserPlus, biometric: LucideFingerprint, reading: LucideLoaderCircle, security: LucideShieldCheck, camera: LucideCamera, info: LucideInfo, edit: LucidePencil };
  protected student = { name: '', enrollment: '', birthDate: '', classId: 0, className: '', shift: '', status: 'Ativo' };
  protected guardian = { name: '', relationship: '', phone: '', email: '' };

  ngOnInit(): void {
    this.studentService.schoolClassOptions().subscribe({
      next: (response) => { this.schoolClasses.set(response.data); this.loading.set(false); this.changeDetector.markForCheck(); },
      error: () => { this.errorMessage.set('Não foi possível carregar as turmas.'); this.loading.set(false); this.changeDetector.markForCheck(); },
    });
  }

  ngOnDestroy(): void { if (this.timer) window.clearTimeout(this.timer); }
  protected goTo(step: number): void { this.step.set(Math.min(4, Math.max(1, step))); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  protected selectClass(id: number): void { const item = this.schoolClasses().find((schoolClass) => schoolClass.id === Number(id)); this.student.classId = Number(id); this.student.className = item?.name ?? ''; this.student.shift = item?.shift === 'morning' ? 'Manhã' : 'Tarde'; }
  protected setGuardianMode(mode: 'new' | 'existing'): void { this.guardianMode = mode; this.selectedGuardian = null; this.guardianResults.set([]); }
  protected searchExistingGuardian(): void { if (this.guardianSearch.trim().length < 2) return; this.studentService.searchGuardians(this.guardianSearch.trim()).subscribe({ next: (response) => { this.guardianResults.set(response.data); this.changeDetector.markForCheck(); }, error: () => this.errorMessage.set('Não foi possível buscar os responsáveis.') }); }
  protected chooseGuardian(guardian: GuardianSummary): void { this.selectedGuardian = guardian; this.guardianSearch = guardian.full_name; }
  protected capture(): void { this.biometric.set('reading'); this.timer = window.setTimeout(() => this.biometric.set('captured'), 1800); }
  protected complete(): void {
    if (!this.student.classId || !this.student.name || !this.student.enrollment || !this.student.birthDate || (this.guardianMode === 'existing' && !this.selectedGuardian) || (this.guardianMode === 'new' && (!this.guardian.name || !this.guardian.email))) { this.errorMessage.set('Complete os dados obrigatórios antes de concluir.'); return; }
    this.saving.set(true); this.errorMessage.set('');
    const guardian = this.guardianMode === 'existing' ? { mode: 'existing' as const, id: this.selectedGuardian!.id } : { mode: 'new' as const, full_name: this.guardian.name, email: this.guardian.email, phone: this.guardian.phone.trim() || null };
    this.studentService.create({ student: { enrollment_number: this.student.enrollment, full_name: this.student.name, date_of_birth: this.student.birthDate, school_class_id: this.student.classId }, guardian }).pipe(finalize(() => { this.saving.set(false); this.changeDetector.markForCheck(); })).subscribe({ next: (response) => this.router.navigate(['/admin/students', response.data.id], { queryParams: { created: '1' } }), error: () => { this.errorMessage.set('Não foi possível cadastrar o aluno. Verifique os dados informados.'); this.changeDetector.markForCheck(); } });
  }
}
